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
        "http://localhost:5173",
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
