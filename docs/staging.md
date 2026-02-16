# Staging Deployment with SSL
 - Create local NS in the hosts file (C:\Windows\System32\drivers\etc)
   ```
   127.0.0.1	stagingcwr.local
   ```
- Running Docker container 
  - Change to staging docker folder
    ```
    cd docker_staging
    ```
  - Create the Dockerfile
    ```
    docker compose build
    ```
  - Running the containers
    ```
    docker compose up -d
    ```
- Setup Django Admin portal
  - Migrate Database:
      ```
      docker compose exec backend python manage.py makemigrations
      docker compose exec backend python manage.py migrate
      ```
   - Collect static files:
      ```
      docker compose exec backend python manage.py collectstatic
     ```
  - Create superuser (admin account):
      ```
      docker compose exec backend python manage.py createsuperuser
      ```
  - Super User
      ```
      mis/wallem1234

# Making SSL Certificate using mkcert tool
- Download mkcert
  ```
  https://github.com/FiloSottile/mkcert/releases

  Download: mkcert-v*-windows-amd64.exe
  ```
- Rename it
  ```
   Rename to: mkcert.exe
  ```
- Put it somewhere permanent
  ```
  C:\mkcert\mkcert.exe
  ```
- Install local CA
  ```
  mkcert -install
  ```
- Generate your staging certificate
  ```
  mkcert stagingcwr.local localhost 127.0.0.1

  It will generate:

   stagingcwr.local+2.pem
   stagingcwr.local+2-key.pem

  Rename to:
   stagingcwr.pem
   stagingcwr-key.pem
  ```
- Copy to certs folder in docker_staging folder
  ```
   ├─ docker_staging/  # Docker staging configuration
   |  └─ nginx         # Default Nginx config for staging
   |  └─ certs         # Mkcert generated certificate
   ```


