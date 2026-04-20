#!/bin/bash


echo "Waiting for database..."

# simple wait loop
while ! nc -z $DB_HOST 3306; do
  sleep 1
done

echo "Database ready"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collect static"
python manage.py collectstatic --noinput

echo "Creating superuser if it doesn't exist..."
DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-mis}
DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-mis@wallem.local}
DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-wallem1234}

echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists(): \
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')" \
    | python manage.py shell

echo "Starting Gunicorn..."
exec "$@"
