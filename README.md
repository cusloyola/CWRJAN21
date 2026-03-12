# CWR version 1
## Check Writing and Retrieval System

A **Check Writing and Retrieval System** is an application designed to automate the creation, recording, and tracking of issued checks while providing easy access to historical check data. It ensures accurate payee details, amounts, and dates, and allows users to quickly search, retrieve, and verify issued checks.

By centralizing check records, the system improves financial control, reduces errors, and supports efficient auditing and reporting.


## 🚀 Features

- Frontend: Vite+React
- Backend:  Python/Django 
- Database: MariaDB
- Proxy Server: Nginx
- Django Rest Framework
- JWT authentication
- ReportLab

## 🧠 Think like this
```
Development = workshop
Staging = rehearsal before live show

You don’t rehearse with half tools.
You don’t develop wearing a tuxedo.
```
## 📜 Documentation/Installation Guide

- [Initial Setup Guide](documentation/setup.md) 
- [Cloning from Gitlab Repo for development](documentation/development.md)
- [Staging Deployment with SSL](documentation/staging.md)

## 📂 Project Structure
```
doc_route/
├─ frontend/        # React + Vite + TypeScript + SWC PIN UI
├─ backend/         # Django + DRF + JWT PIN API
├─ docker_dev/      # Docker dev configuration
|  └─ nginx         # Default Nginx config for dev
├─ docker_staging/  # Docker staging configuration
|  └─ nginx         # Default Nginx config for staging
|  └─ certs         # Mkcert generated certificate
├─ documentation/   # Documentation
├─ env/             # Python environment
└─ README.md        # Project overview
```
## 📜 License
All Rights Reserved © 2026 by Wallem Shipping Philippines,Inc and its affliate companies