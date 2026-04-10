import logging
from pathlib import Path

from celery import shared_task
from django.conf import settings
from django.db import IntegrityError
from google.oauth2 import service_account
from googleapiclient.errors import HttpError
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


def _build_drive_folder_query():
    # Search the configured folder and ignore trashed items.
    query = ["trashed = false"]

    parent_folder_id = getattr(settings, "GOOGLE_DRIVE_PARENT_FOLDER_ID", "")
    if parent_folder_id:
        query.append(f"'{parent_folder_id}' in parents")

    return " and ".join(query)


@shared_task(name="api.sync_supporting_docs_from_drive_uploads")
def sync_supporting_docs_from_drive_uploads():
    page_size = int(getattr(settings, "GOOGLE_DRIVE_UPLOAD_PAGE_SIZE", 100))
    include_items_from_all_drives = _truthy(
        getattr(settings, "GOOGLE_DRIVE_INCLUDE_ITEMS_FROM_ALL_DRIVES", True)
    )
    supports_all_drives = _truthy(getattr(settings, "GOOGLE_DRIVE_SUPPORTS_ALL_DRIVES", True))

    query = _build_drive_folder_query()

    logger.info(
        "Drive sync start: page_size=%s parent_folder_id=%s query=%s",
        page_size,
        bool(getattr(settings, "GOOGLE_DRIVE_PARENT_FOLDER_ID", "")),
        query,
    )

    try:
        service = _build_drive_client()
        files = []
        page_token = None
        page_count = 0

        while True:
            response = (
                service.files()
                .list(
                    q=query,
                    fields="nextPageToken,files(id,name,createdTime,modifiedTime,webViewLink)",
                    orderBy="modifiedTime desc",
                    pageSize=page_size,
                    pageToken=page_token,
                    includeItemsFromAllDrives=include_items_from_all_drives,
                    supportsAllDrives=supports_all_drives,
                )
                .execute()
            )
            batch = response.get("files", [])
            files.extend(batch)
            page_count += 1
            page_token = response.get("nextPageToken")
            if not page_token:
                break

        logger.info("Drive API fetch complete: pages=%s fetched_files=%s", page_count, len(files))
    except (FileNotFoundError, ValueError) as exc:
        logger.error(
            "Drive sync configuration error: %s. Set GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE to a valid in-container path.",
            exc,
        )
        return {"processed_files": 0, "matched": 0, "updated": 0, "unmatched": 0}
    except HttpError as exc:
        logger.error(
            "Drive API request failed: status=%s details=%s",
            getattr(exc.resp, "status", "unknown"),
            exc,
        )
        return {"processed_files": 0, "matched": 0, "updated": 0, "unmatched": 0}
    except Exception:
        logger.exception("Drive API lookup failed for recent uploads sync")
        raise

    if not files:
        logger.info("No Drive files found in the configured folder")
        return {"processed_files": 0, "matched": 0, "updated": 0, "unmatched": 0}

    # Map each file to possible refs: exact name and stem (name without extension).
    file_candidates = {}
    lookup_keys = set()
    for drive_file in files:
        raw_name = (drive_file.get("name") or "").strip()
        if not raw_name:
            logger.info("Skipping Drive file with empty name: file_id=%s", drive_file.get("id"))
            continue

        stem_name = Path(raw_name).stem.strip()
        candidates = [raw_name]
        if stem_name and stem_name != raw_name:
            candidates.append(stem_name)

        file_candidates[raw_name] = {"file": drive_file, "candidates": candidates}
        lookup_keys.update(candidates)
        logger.info(
            "Drive file detected: name=%s stem=%s file_id=%s modifiedTime=%s webViewLink_present=%s candidates=%s",
            raw_name,
            stem_name,
            drive_file.get("id"),
            drive_file.get("modifiedTime"),
            bool(drive_file.get("webViewLink")),
            candidates,
        )

    if not file_candidates:
        logger.info("No eligible Drive uploads with filenames to compare")
        return {"processed_files": len(files), "matched": 0, "updated": 0, "unmatched": 0}

    logger.info(
        "Drive lookup keys prepared: unique_keys=%s sample_keys=%s",
        len(lookup_keys),
        sorted(list(lookup_keys))[:20],
    )

    transactions = {
        tx.transaction_ref: tx
        for tx in Transaction.objects.filter(transaction_ref__in=lookup_keys)
    }

    logger.info(
        "Matching against transactions: candidate_refs=%s matched_transactions_in_db=%s",
        len(lookup_keys),
        len(transactions),
    )

    matched_count = 0
    updated_count = 0
    unmatched_count = 0

    for original_name, item in file_candidates.items():
        drive_file = item["file"]
        candidates = item["candidates"]

        logger.info(
            "Evaluating Drive file against transaction refs: file_name=%s candidates=%s",
            original_name,
            candidates,
        )

        transaction = None
        matched_ref = None
        for candidate in candidates:
            logger.info(
                "Trying candidate ref=%s for file_name=%s",
                candidate,
                original_name,
            )
            tx = transactions.get(candidate)
            if tx:
                transaction = tx
                matched_ref = candidate
                logger.info(
                    "Candidate matched transaction: candidate_ref=%s transaction_id=%s",
                    candidate,
                    tx.transaction_id,
                )
                break

        if not transaction:
            unmatched_count += 1
            logger.info(
                "No transaction match for Drive file name=%s candidates=%s",
                original_name,
                candidates,
            )
            continue

        matched_count += 1
        file_id = drive_file.get("id")
        web_view_link = drive_file.get("webViewLink")

        if not file_id or not web_view_link:
            logger.warning(
                "Skipping matched file due to missing id/link: file_name=%s matched_ref=%s file_id=%s has_link=%s",
                original_name,
                matched_ref,
                file_id,
                bool(web_view_link),
            )
            continue

        if transaction.supporting_docs == web_view_link:
            logger.info(
                "Already up-to-date: transaction_ref=%s transaction_id=%s file_name=%s",
                transaction.transaction_ref,
                transaction.transaction_id,
                original_name,
            )
            continue

        try:
            logger.info(
                "Updating supporting_docs: transaction_ref=%s transaction_id=%s new_link=%s",
                transaction.transaction_ref,
                transaction.transaction_id,
                web_view_link,
            )
            transaction.supporting_docs = web_view_link
            transaction.save(update_fields=["supporting_docs"])
            updated_count += 1
            logger.info(
                "Updated supporting_docs: transaction_ref=%s transaction_id=%s file_name=%s file_id=%s",
                transaction.transaction_ref,
                transaction.transaction_id,
                original_name,
                file_id,
            )
        except IntegrityError:
            logger.exception(
                "Failed to save supporting_docs for transaction %s (ref=%s)",
                transaction.transaction_id,
                transaction.transaction_ref,
            )

    logger.info(
        "Drive sync complete: fetched=%s matched=%s updated=%s unmatched=%s",
        len(files),
        matched_count,
        updated_count,
        unmatched_count,
    )
    return {
        "processed_files": len(files),
        "matched": matched_count,
        "updated": updated_count,
        "unmatched": unmatched_count,
    }
