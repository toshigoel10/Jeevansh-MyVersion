import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "jeevansh")
DEFAULT_LATITUDE = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
DEFAULT_LONGITUDE = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
FALLBACK_TO_MEMORY = os.getenv("FALLBACK_TO_MEMORY", "true").lower() == "true"