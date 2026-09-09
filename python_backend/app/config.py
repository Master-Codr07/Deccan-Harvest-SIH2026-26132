import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kaushikakshara@localhost:5432/deccan_harvest")
SECRET_KEY = os.getenv("SECRET_KEY", "deccan_harvest_static_secret_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
