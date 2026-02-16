## Cloning Repo for Development
 - Create local NS in the hosts file (C:\Windows\System32\drivers\etc)
   ```
   127.0.0.1	devcwr.local
   ```
 - Create the folder 
   ```
   mkdir cwr
   cd cwr
   ```
- Initialize Git in the folder
  ```
  git init
  ```
- Add the remote repository
  ```
  git remote add origin git@192.168.197.18:cwr/dev/cwrv1.git
  ```
- Pull from repo
  ```
  git pull origin main
  ```
- Backend Install
  - Create python environment
    ```
    python -m venv env
    ```
  - Activate environment
    ```
    env\Scripts\activate
    ```
  - Change to backend folder
    ```
    cd backend
    ```
  - Install dependencies
    ```
    pip install -r requirements.txt
    ```
- Frontend Install
  - Change to frontend folder
    ```
    cd frontend
    ```
  - Install dependencies
    ```
    npm install
    ```
- Running Docker container 
  - Change to development docker folder
    ```
    cd docker_dev
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
      python manage.py makemigrations
      python manage.py migrate
      ```
   - Collect static files:
      ```
      python manage.py collectstatic
     ```
  - Create superuser (admin account):
      ```
      python manage.py createsuperuser
      ```
  - Super User
      ```
      mis/wallem1234