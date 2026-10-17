from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME, FALLBACK_TO_MEMORY
from app.in_memory_db import InMemoryDatabase

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Test connection
        await client.admin.command("ping")
        db = client[DATABASE_NAME]

        # Create indexes
        await db.donors.create_index([("location", "2dsphere")])
        await db.donors.create_index("phone", unique=True)
        await db.requests.create_index("created_at")

        print(f"[OK] Connected to MongoDB: {DATABASE_NAME}")
    except Exception as exc:
        if FALLBACK_TO_MEMORY:
            print(f"[INFO] MongoDB not reachable. Switching to InMemoryDatabase fallback.")
            db = InMemoryDatabase()
        else:
            raise exc

async def close_db():
    global client
    if client:
        client.close()
        print("[INFO] MongoDB connection closed")


def get_db():
    global db
    if db is None:
        if FALLBACK_TO_MEMORY:
            print("[INFO] Initializing lazy InMemoryDatabase instance.")
            db = InMemoryDatabase()
        else:
            raise RuntimeError("Database not initialized. Please call connect_db() first.")
    return db
