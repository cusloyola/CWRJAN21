FROM minio/minio:latest

# Default working directory (optional, for consistency with your other dev images)
WORKDIR /data

# Expose MinIO API + Console ports
EXPOSE 9000 9001

# Default command (S3 + Web Console)
CMD ["server", "/data", "--console-address", ":9001"]