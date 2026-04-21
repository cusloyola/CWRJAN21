## Cloning Repo from GitLab

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
  git remote add dev git@192.168.197.18:cwr/dev/cwrv1.git
  ```
- Pull from repo
  ```
  git pull dev main
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
  - Create directory
   ```
    mkdir backend
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
- Docker container install
  - Change to docker folder
    ```
    cd docker
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
      python manage.py migrate
      ```
  - Create superuser (admin account):
      ```
      python manage.py createsuperuser
      ```
  - Super User
      ```
      mis/wallem1234