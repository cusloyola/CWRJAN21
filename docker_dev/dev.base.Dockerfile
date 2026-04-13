FROM ubuntu:24.04

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# System dependencies
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

# Install Python 3.13.7
WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/3.13.7/Python-3.13.7.tgz && \
    tar -xzf Python-3.13.7.tgz && \
    cd Python-3.13.7 && \
    ./configure --enable-optimizations && \
    make -j$(nproc) && \
    make altinstall && \
    cd .. && rm -rf Python-3.13.7*

# Symlink
RUN ln -s /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -s /usr/local/bin/pip3.13 /usr/bin/pip3

WORKDIR /app