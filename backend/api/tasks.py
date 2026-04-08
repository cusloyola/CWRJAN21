import logging
from pathlib import Path

from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings
from django.db import IntegrityError
from google.oauth2 import service_account
from googleapiclient.discovery import build

from .models import Transaction

logger = logging.getLogger("api.tasks")

DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def _truthy(value):
    return str(value).lower() in {"1", "true", "yes", "on"}


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


def _build_drive_query(transaction_ref):
    # Search for exact filename and ignore trashed items.
    safe_name = transaction_ref.replace("'", "\\'")
    query = [
        f"name = '{safe_name}'",
        "trashed = false",
    ]

    parent_folder_id = getattr(settings, "GOOGLE_DRIVE_PARENT_FOLDER_ID", "")
    if parent_folder_id:
        query.append(f"'{parent_folder_id}' in parents")

    return " and ".join(query)


@shared_task(bind=True, name="api.sync_transaction_supporting_docs")
def sync_transaction_supporting_docs(self, transaction_id):
    transaction = Transaction.objects.filter(pk=transaction_id).first()
    if not transaction:
        logger.warning("Transaction %s not found; skipping supporting docs sync", transaction_id)
        return

    retry_seconds = int(getattr(settings, "GOOGLE_DRIVE_LOOKUP_RETRY_SECONDS", 300))
    max_retries = int(getattr(settings, "GOOGLE_DRIVE_LOOKUP_MAX_RETRIES", 288))

    include_items_from_all_drives = _truthy(
        getattr(settings, "GOOGLE_DRIVE_INCLUDE_ITEMS_FROM_ALL_DRIVES", True)
    )
    supports_all_drives = _truthy(getattr(settings, "GOOGLE_DRIVE_SUPPORTS_ALL_DRIVES", True))

    query = _build_drive_query(transaction.transaction_ref)

    try:
        service = _build_drive_client()
        response = (
            service.files()
            .list(
                q=query,
                fields="files(id,name,modifiedTime,webViewLink)",
                orderBy="modifiedTime desc",
                pageSize=10,
                includeItemsFromAllDrives=include_items_from_all_drives,
                supportsAllDrives=supports_all_drives,
            )
            .execute()
        )
    except Exception:
        logger.exception(
            "Drive API lookup failed for transaction %s (ref=%s)",
            transaction_id,
            transaction.transaction_ref,
        )
        raise

    files = response.get("files", [])
    if not files:
        if self.request.retries >= max_retries:
            logger.warning(
                "No Drive file found for transaction %s (ref=%s) after %s retries",
                transaction_id,
                transaction.transaction_ref,
                self.request.retries,
            )
            return

        logger.info(
            "No Drive file found for transaction %s (ref=%s); retry %s/%s in %ss",
            transaction_id,
            transaction.transaction_ref,
            self.request.retries + 1,
            max_retries,
            retry_seconds,
        )
        try:
            raise self.retry(countdown=retry_seconds)
        except MaxRetriesExceededError:
            logger.warning(
                "Max retries exceeded while waiting for Drive file for transaction %s",
                transaction_id,
            )
            return

    chosen_file = files[0]
    file_id = chosen_file.get("id")
    web_view_link = chosen_file.get("webViewLink") or f"https://drive.google.com/file/d/{file_id}/view"

    if not file_id:
        logger.warning(
            "Drive API returned file without id for transaction %s (ref=%s)",
            transaction_id,
            transaction.transaction_ref,
        )
        return

    try:
        transaction.supporting_docs = web_view_link
        transaction.save(update_fields=["supporting_docs"])
    except IntegrityError:
        logger.exception(
            "Failed to save supporting_docs link for transaction %s due to DB integrity error",
            transaction_id,
        )
        raise

    logger.info(
        "Updated supporting_docs for transaction %s (ref=%s) using Drive file %s",
        transaction_id,
        transaction.transaction_ref,
        file_id,
    )
