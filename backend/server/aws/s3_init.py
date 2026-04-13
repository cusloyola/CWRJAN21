import boto3
from django.conf import settings


def create_bucket_if_not_exists():
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )

    bucket = settings.AWS_STORAGE_BUCKET_NAME

    try:
        existing = s3.list_buckets()
        if bucket not in [b["Name"] for b in existing.get("Buckets", [])]:
            s3.create_bucket(Bucket=bucket)
    except Exception as e:
        print(f"[S3 INIT] Error: {e}")