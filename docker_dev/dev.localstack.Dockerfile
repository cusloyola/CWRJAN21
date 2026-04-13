
FROM localstack/localstack:latest

# --------------------------
# Optional: Install extra tools (AWS CLI v2 already included in most images)
# --------------------------
USER root

RUN apk add --no-cache bash curl jq

# --------------------------
# Init scripts directory
# (LocalStack auto-runs scripts placed here)
# --------------------------
RUN mkdir -p /etc/localstack/init/ready.d

# --------------------------
# Optional bootstrap script for S3 bucket creation
# --------------------------
COPY ./docker_dev/localstack/init-s3.sh /etc/localstack/init/ready.d/init-s3.sh

RUN chmod +x /etc/localstack/init/ready.d/init-s3.sh

# --------------------------
# Switch back to default user
# --------------------------
USER localstack