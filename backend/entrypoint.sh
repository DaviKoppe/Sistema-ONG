echo "🔥 ENTRYPOINT ESTÁ SENDO EXECUTADO"
#!/bin/sh

echo "🔄 Rodando migrations..."
python manage.py migrate

echo "📦 Coletando static..."
python manage.py collectstatic --noinput

echo "🚀 Iniciando servidor..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000