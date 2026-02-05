FROM ubuntu:24.04

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATA_UPLOAD_MAX_MEMORY_SIZE=52428800 \
    FILE_UPLOAD_MAX_MEMORY_SIZE=52428800


# Basic system dependencies for Python + Django + mysqlclient
RUN apt-get update && apt-get install -y \
    build-essential wget curl git nano unzip\
    libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev \
    libffi-dev liblzma-dev tk-dev \
    default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.13.7
WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/3.13.7/Python-3.13.7.tgz && \
    tar -xvzf Python-3.13.7.tgz && \
    cd Python-3.13.7 && \
    ./configure --enable-optimizations && \
    make -j$(nproc) && \
    make altinstall && \
    cd .. && rm -rf Python-3.13.7*

# Symlink python3 / pip3
RUN ln -s /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -s /usr/local/bin/pip3.13 /usr/bin/pip3

# 🔹 Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && ./aws/install && \
    rm -rf awscliv2.zip ./aws


WORKDIR /app

# Install Gunicorn separately (not in requirements.txt)
# RUN pip3 install --no-cache-dir gunicorn

# Copy requirements first
COPY ../backend/requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the Django project
COPY ../backend /app/

# Collect static (optional)
RUN python3 manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
