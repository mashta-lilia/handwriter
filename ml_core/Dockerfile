FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt

COPY . .


RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

RUN chown -R app:app /app

USER app

CMD ["python", "worker.py"] 
