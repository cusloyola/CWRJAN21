FROM ubuntu:24.04

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATA_UPLOAD_MAX_MEMORY_SIZE=52428800 \
    FILE_UPLOAD_MAX_MEMORY_SIZE=52428800

WORKDIR /app

# Basic system dependencies for Python + Django + mysqlclient
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY ../backend/requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt \
    pip3 install --no-cache-dir gunicorn

# Copy the Django project
COPY ../backend /app/

# Collect static (optional)
RUN python3 manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "cwr.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
