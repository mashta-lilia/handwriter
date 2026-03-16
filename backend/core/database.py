import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(env_path)
else:
    print("DEBUG: .env file not found")

# Пока так
database_url = "postgresql://postgres:mypassword@localhost:5432/my_db_name"

if not database_url:
    raise ValueError(f"DATABASE_URL not found! Check if it exists in {env_path}")

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    '''
        Получать сессии дб
    '''
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()