"""
Central configuration for the VISTA backend.
Values are read from environment variables with sane defaults so the
app runs out of the box in development.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")

    # In-memory session buffer size. Once exceeded, oldest packets are
    # dropped (FIFO). Swap for SQLite/Postgres later without touching
    # the routes/sockets layer — see services/session_manager.py
    MAX_PACKET_BUFFER = int(os.getenv("MAX_PACKET_BUFFER", 5000))

    # Storage backend switch. Only "memory" is implemented in this
    # version; "sqlite" is a reserved extension point.
    STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "memory")


config = Config()
