FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt /app/requirements.txt
RUN python -c "from pathlib import Path; import codecs; p=Path('/app/requirements.txt'); b=p.read_bytes(); needs=(b.startswith(codecs.BOM_UTF16_LE) or b.startswith(codecs.BOM_UTF16_BE) or (len(b)>1 and b[1:2]==b'\\x00')); (p.write_text(b.decode('utf-16'), encoding='utf-8') if needs else None)"
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
