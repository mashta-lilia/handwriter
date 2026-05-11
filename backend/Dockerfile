FROM python:3.12-slim
 
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
 
WORKDIR /app
 
# Install gcc and other build tools needed for asyncpg and pydantic-core
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . .
 
EXPOSE 8000

RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin -c "Docker image user" app

RUN chown -R app:app /app

USER app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers"]