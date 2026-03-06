FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \ 
    default-libmysqlclient-dev \ 
    build-essential \ 
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY ../backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt 
RUN pip install --no-cache-dir gunicorn

COPY backend /app/

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
