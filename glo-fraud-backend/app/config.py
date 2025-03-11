import os
from dotenv import load_dotenv

load_dotenv()

JWT_ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET")

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
