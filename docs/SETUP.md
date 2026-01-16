## BACKEND (DJANGO)

- Create python environment
    ```
    python -m venv env
    ```
- Activate environment
    ```
    env\Scripts\activate
    ```
- Create directory
   ```
    mkdir backend
    cd backend
   ```
- Install Django
    ```
    pip install django django-extensions
    ```
- Update Pip
    ```
    python.exe -m pip install --upgrade pip
    ```
- Create Project
    ```
    django-admin startproject server .
    ```
- Create Application
    ```
    python manage.py startapp api
    or 
    django-admin startapp api
    ```
- Configure Django CORS
    ```
    pip install django-cors-headers
    ```
- Edit server/setting.py, configure CORS
    ```
    INSTALLED_APPS = [
        # ...
        'corsheaders',
        # ...
    ]

    MIDDLEWARE = [
        # ...
        'corsheaders.middleware.CorsMiddleware',
        # ...
    ]
    
    # Allow the frontend to access the backend API
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
    ]
    ```
- Set Time to local
   ```
   TIME_ZONE = 'Asia/Manila'
   ```
- Create Application folder
    ```
    django-admin startapp api
    ``` 
- Install python-dotenv
    ```
    pip install python-dotenv
    ```
- Create a .env file inside /backend folder 
    - inside the Django Project root, same level as manage.py
- Load dotenv in Django setting.py
  - At the top of setting.py:
  ```
  from pathlib import Path
  import os
  from dotenv import load_dotenv

  BASE_DIR = Path(__file__).resolve().parent.parent

  load_dotenv(BASE_DIR / ".env")
  ```
- Use environment variables in setting.py
  ```
  DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

  SECRET_KEY = os.getenv('SECRET_KEY') 
  ```

- Add all dependencies to requirements.txt
    ```
    pip freeze > requirements.txt
    ```

- Setup Django Admin portal

  - Migrate Database:
      ```
      python manage.py migrate
      ```
  - Create superuser (admin account):
      ```
      python manage.py createsuperuser
      ```
  - Super User
      ```
      mis/wallem1234
      ```
- Setup Django REST Framework + JWT
  - Install required packages:
    ```
    pip install djangorestframework djangorestframework-simplejwt
    ```
  - Update INSTALLED_APPS:
    ```
    INSTALLED_APPS = [
        # Django
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',

        # Third-party
        'corsheaders',
        'rest_framework',
        'django_extensions',

        # Local
        'api',
    ]
    ```
  - DRF Global Configurations(Setting.py):
    ```
    from datetime import timedelta

    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ),
        'DEFAULT_PERMISSION_CLASSES': (
            'rest_framework.permissions.IsAuthenticated',
        ),
    }

    ```
  - JWT Configuration (SimpleJWT)
    ```
    SIMPLE_JWT = {
        'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
        'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
        'ROTATE_REFRESH_TOKENS': True,
        'BLACKLIST_AFTER_ROTATION': True,

        'AUTH_HEADER_TYPES': ('Bearer',),
    }
    ```


## FRONTEND (VITE+REACT)
- Create directory
   ```
    mkdir backend
    cd backend
   ```
- Create a your vite + react app
  ```
  npm create vite@latest .
  ```
- Choose these options:
  ```
    ? Current directory is not empty. Please choose how to proceed: » - Use arrow-keys. Return to submit.
        Remove existing files and continue
        Cancel operation
    >   Ignore files and continue

    √ Current directory is not empty. Please choose how to proceed: » Ignore files and continue
    ? Select a framework: » - Use arrow-keys. Return to submit.
        Vanilla
        Vue
    >   React
        Preact
        Lit
        Svelte
        Solid
        Qwik
        Angular
        Others

    √ Current directory is not empty. Please choose how to proceed: » Ignore files and continue
    √ Select a framework: » React
    ? Select a variant: » - Use arrow-keys. Return to submit.
    >   TypeScript
        TypeScript + SWC
        JavaScript
        JavaScript + SWC
        Remix ↗

  ```
- Install npm
  ```
    npm install
  ```

## DATABASE SERVER (MYSQL)
- MariaDB Configuration
  - Environment Variables:
    - MYSQL_ROOT_PASSWORD: Root password for the MySQL database.
    - MYSQL_DATABASE: Name of the database to create on startup.
    - MYSQL_USER: Username for the application to connect to MySQL.
    - MYSQL_PASSWORD: Password for the MySQL user.
  - Volume:
    - The mysql_data volume stores MySQL data on the host, ensuring that your data persists even if the MySQL container is removed.
  - Networking:
     - All services are connected to the same app-network, allowing backend to communicate with mysql by using mysql as the host name in its database configuration.
- Install python package
  ```
  pip install mysqlclient
  ```

- Configure Django to Use MySQL
  
  In your Django settings (settings.py), configure the database settings to connect to the MySQL service using the environment variables defined in docker-compose.yml:
  ```
  # settings.py

  DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE'),
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT':  os.getenv('DB_PORT'),
    }
  }
  ```

## PROXY SERVER (NGINX)
- Create an nginx.conf file in nginx directory
  ```
    # nginx/nginx.conf
    events { }

    http {
        upstream frontend {
            server nvrdm_frontend:3000;
        }

        upstream backend {
            server nvrdm_backend:8000;
        }

        server {
            listen 80;

            # Route API requests to the Django backend
            location /api/ {
                proxy_pass http://backend;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Route all other requests to the Vite frontend
            location / {
                proxy_pass http://frontend;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
    }
  ```
 - In this configuration
    ```
     - API requests (e.g., http://localhost/api/) are routed to the Django backend.
     - All other requests (e.g., /, /about, etc.) go to the Vite + React frontend.
   ```

 - Update Frontend to Use Proxy Path

   In the frontend code, make sure API requests are pointed to /api instead of the backend’s direct URL. This will work with the reverse proxy to route requests correctly.

   For example, in a file like src/api.js:
   ```
    const API_URL = "/api"; // No need for full URL, as Nginx handles routing

    export const fetchData = async () => {
      const response = await fetch(`${API_URL}/endpoint`);
      return response.json();
    };

   ```
## Accessing the Application
- Frontend and Backend: Accessible through http://localhost
  - **Frontend:** All routes except those prefixed with /api/
  - **Backend API:** Routes prefixed with /api/

 This setup provides a streamlined approach for routing requests to the appropriate service while keeping the frontend and backend isolated within their own containers.