#!/bin/bash

set -e

echo "Initializing LocalStack S3..."

aws --endpoint-url=http://localhost:4566 s3 mb s3://cwr-bucket || true

echo "S3 bucket ready: cwr-bucket"