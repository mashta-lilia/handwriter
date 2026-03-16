from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Эти переменные должны быть в твоем .env на сервере
    DATABASE_URL: str
    REDIS_URL: str
    
    # Если используются для Minio
    MINIO_ROOT_USER: str = "admin"
    MINIO_ROOT_PASSWORD: str = "SuperSecretPassword"
    MINIO_ENDPOINT: str = "minio:9000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    """Функция для тех частей кода, которые привыкли вызывать get_settings()"""
    return Settings()

# Переменная для тех частей кода, которые хотят просто импортировать settings
settings = get_settings()