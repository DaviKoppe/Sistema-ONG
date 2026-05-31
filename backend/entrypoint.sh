#!/bin/sh
echo "=== ENTRYPOINT INICIANDO ==="
echo "=== RODANDO MIGRATE ==="
python manage.py migrate
echo "=== MIGRATE CONCLUIDO ==="
echo "=== RODANDO COLLECTSTATIC ==="
python manage.py collectstatic --noinput
echo "=== COLLECTSTATIC CONCLUIDO ==="
echo "=== INICIANDO GUNICORN ==="
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000