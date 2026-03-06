FROM redis:7-alpine

# Set timezone (optional)
ENV TZ=Asia/Manila

# Create custom redis config
COPY docker_dev/redis/redis.conf /usr/local/etc/redis/redis.conf

# Expose redis port
EXPOSE 6379

# Run redis with custom config
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
