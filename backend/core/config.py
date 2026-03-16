from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Настройки базы данных
    DATABASE_URL: str
    
    # Настройки Redis
    REDIS_URL: str
    
    # Настройки Minio
    MINIO_ROOT_PASSWORD: str
    
    # Конфигурация для загрузки из .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Создаем экземпляр настроек, который будет импортировать main.py
settings = Settings()