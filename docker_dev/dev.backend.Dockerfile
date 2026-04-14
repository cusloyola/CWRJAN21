# --------------------------
# Base Stage
# --------------------------
FROM ubuntu:24.04 AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y \
    build-essential wget curl git nano unzip \
    libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev \
    libffi-dev liblzma-dev tk-dev \
    default-libmysqlclient-dev pkg-config \
    libjpeg-dev \
    libfreetype6-dev \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/3.13.7/Python-3.13.7.tgz && \
    tar -xzf Python-3.13.7.tgz && \
    cd Python-3.13.7 && \
    ./configure --enable-optimizations && \
    make -j$(nproc) && \
    make altinstall && \
    cd .. && rm -rf Python-3.13.7*

RUN ln -s /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -s /usr/local/bin/pip3.13 /usr/bin/pip3

WORKDIR /app

# --------------------------
# Backend Stage
# --------------------------
FROM base AS backend

ENV DATA_UPLOAD_MAX_MEMORY_SIZE=52428800 \
    FILE_UPLOAD_MAX_MEMORY_SIZE=52428800

COPY ../backend/requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt

COPY ../backend /app/

RUN python3 manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

# --------------------------
# ReportLab Stage
# --------------------------
FROM base AS report

COPY ../backend/requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt \
    && pip3 install reportlab

COPY ../backend /app/

EXPOSE 8001

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8001"]