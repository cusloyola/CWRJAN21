import logging
import mimetypes
from pathlib import Path

from celery import shared_task
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload

from .models import Transaction

logger = logging.getLogger("api.tasks")

DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"]


def _build_drive_client():
    credentials_file = getattr(settings, "GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE", "")
    if not credentials_file:
        raise ValueError("GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE is not set")

    credentials_path = Path(credentials_file)
    if not credentials_path.exists():
        raise FileNotFoundError(f"Service account file not found: {credentials_file}")

    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_path),
        scopes=DRIVE_SCOPES,
    )
    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def _build_drive_file_metadata(transaction, source_file_name):
    parent_folder_id = getattr(settings, "GOOGLE_DRIVE_PARENT_FOLDER_ID", "")
    drive_file_name = Path(source_file_name).name

    metadata = {"name": drive_file_name}
    if parent_folder_id:
        metadata["parents"] = [parent_folder_id]

    return metadata


def _set_transaction_upload_state(transaction, status, error_message="", supporting_docs=None, google_drive_link=None):
    transaction.supporting_doc_status = status
    transaction.supporting_doc_error = error_message or ""
    update_fields = ["supporting_doc_status", "supporting_doc_error"]

    if supporting_docs is not None:
        transaction.supporting_docs = supporting_docs
        update_fields.append("supporting_docs")

    if google_drive_link is not None:
        transaction.google_drive_link = google_drive_link
        update_fields.append("google_drive_link")

    transaction.save(update_fields=update_fields)


@shared_task(name="api.upload_transaction_supporting_doc")
def upload_transaction_supporting_doc(transaction_id):
    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)
    except Transaction.DoesNotExist:
        logger.error("Transaction not found for supporting doc upload: transaction_id=%s", transaction_id)
        return {"status": "missing_transaction"}

    if not transaction.supporting_doc_file:
        logger.warning(
            "Transaction has no supporting_doc_file to upload: transaction_id=%s transaction_ref=%s",
            transaction.transaction_id,
            transaction.transaction_ref,
        )
        _set_transaction_upload_state(
            transaction,
            status="FAILED",
            error_message="No supporting document file was attached.",
        )
        return {"status": "missing_file"}

    if transaction.supporting_docs and transaction.supporting_doc_status == "UPLOADED":
        logger.info(
            "Transaction already uploaded to Google Drive: transaction_id=%s transaction_ref=%s",
            transaction.transaction_id,
            transaction.transaction_ref,
        )
        return {"status": "already_uploaded", "drive_link": transaction.google_drive_link or transaction.supporting_docs}

    try:
        _set_transaction_upload_state(transaction, status="UPLOADING")

        drive_service = _build_drive_client()
        source_file_name = transaction.supporting_doc_file.name
        content_type = mimetypes.guess_type(source_file_name)[0] or "application/octet-stream"

        transaction.supporting_doc_file.open("rb")
        try:
            media = MediaIoBaseUpload(transaction.supporting_doc_file, mimetype=content_type, resumable=False)
            created_file = (
                drive_service.files()
                .create(
                    body=_build_drive_file_metadata(transaction, source_file_name),
                    media_body=media,
                    fields="id, webViewLink, name",
                    supportsAllDrives=True,
                )
                .execute()
            )
        finally:
            transaction.supporting_doc_file.close()

        drive_link = created_file.get("webViewLink", "")
        if not drive_link:
            raise ValueError("Google Drive did not return a webViewLink")

        _set_transaction_upload_state(
            transaction,
            status="UPLOADED",
            supporting_docs=drive_link,
            google_drive_link=drive_link,
        )

        logger.info(
            "Supporting document uploaded to Google Drive: transaction_id=%s transaction_ref=%s drive_file_id=%s",
            transaction.transaction_id,
            transaction.transaction_ref,
            created_file.get("id"),
        )
        return {"status": "uploaded", "drive_link": drive_link}
    except (FileNotFoundError, ValueError) as exc:
        logger.error(
            "Google Drive upload configuration error for transaction_id=%s transaction_ref=%s: %s",
            transaction.transaction_id,
            transaction.transaction_ref,
            exc,
        )
        _set_transaction_upload_state(transaction, status="FAILED", error_message=str(exc))
        return {"status": "failed", "error": str(exc)}
    except HttpError as exc:
        error_message = f"Google Drive upload failed with status {getattr(exc.resp, 'status', 'unknown')}"
        exc_text = str(exc)
        if "storageQuotaExceeded" in exc_text:
            error_message = (
                "Google Drive upload failed: service account has no personal storage quota. "
                "Upload to a Shared Drive folder and grant the service account Content manager access."
            )
        elif "insufficientParentPermissions" in exc_text:
            error_message = (
                "Google Drive upload failed: insufficient permissions for the configured parent folder. "
                "Share the folder with the service account and grant edit/content manager rights."
            )
        elif getattr(exc.resp, 'status', None) == 403:
            error_message = "Google Drive upload failed: permission denied for the target folder."
        logger.error(
            "%s transaction_id=%s transaction_ref=%s details=%s",
            error_message,
            transaction.transaction_id,
            transaction.transaction_ref,
            exc,
        )
        _set_transaction_upload_state(transaction, status="FAILED", error_message=error_message)
        return {"status": "failed", "error": error_message}
    except Exception as exc:
        logger.exception(
            "Unexpected error while uploading supporting document for transaction_id=%s transaction_ref=%s",
            transaction.transaction_id,
            transaction.transaction_ref,
        )
        _set_transaction_upload_state(transaction, status="FAILED", error_message=str(exc))
        raise
