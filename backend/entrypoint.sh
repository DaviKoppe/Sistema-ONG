echo "🔥 ENTRYPOINT ESTÁ SENDO EXECUTADO"
#!/bin/sh

echo "🔥 ENTRYPOINT EXECUTANDO"

python manage.py migrate

python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000