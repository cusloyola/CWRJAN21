
FROM localstack/localstack:3.0

# --------------------------
# Optional: Install extra tools (AWS CLI v2 already included in most images)
# --------------------------
USER root

RUN rm -rf /tmp/localstack || true
RUN mkdir -p /tmp/localstack
RUN chown -R localstack:localstack /tmp/localstack

# Fix data volume permissions
RUN mkdir -p /var/lib/localstack
RUN chown -R localstack:localstack /var/lib/localstack


# --------------------------
# Init scripts directory
# --------------------------
RUN mkdir -p /etc/localstack/init/ready.d
COPY docker_dev/localstack/init-s3.sh /etc/localstack/init/ready.d/init-s3.sh
RUN chmod +x /etc/localstack/init/ready.d/init-s3.sh

# --------------------------
# Switch back to default user
# --------------------------
USER localstack