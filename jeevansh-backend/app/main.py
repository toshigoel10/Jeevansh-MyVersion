from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import connect_db, close_db
from app.routes import donors, requests, banks


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Jeevansh API",
    description="Blood donor coordination backend for INNOTECH26",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(donors.router)
app.include_router(requests.router)
app.include_router(banks.router)



@app.get("/")
async def root():
    return {"message": "🩸 Jeevansh API is running", "docs": "/docs"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}