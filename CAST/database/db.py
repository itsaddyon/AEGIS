"""SQLite connection + first-run initialization for CAST."""
from __future__ import annotations

import sqlite3
from pathlib import Path

import sys

if getattr(sys, 'frozen', False):
    import os
    BUNDLE_DIR = Path(sys._MEIPASS)
    # Store DB in user's AppData folder to guarantee write permissions
    app_data = Path(os.getenv('LOCALAPPDATA', Path.home() / 'AppData' / 'Local'))
    DB_DIR = app_data / "AEGIS" / "CAST"
    DB_DIR.mkdir(parents=True, exist_ok=True)
    DB_PATH = DB_DIR / "cast.db"
    SCHEMA_PATH = BUNDLE_DIR / "database" / "schema.sql"
else:
    DB_DIR = Path(__file__).parent
    DB_PATH = DB_DIR / "cast.db"
    SCHEMA_PATH = DB_DIR / "schema.sql"


def get_connection() -> sqlite3.Connection:
    """Return a SQLite connection with row access by column name."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn


def init_db() -> None:
    """Create tables and seed reference data if they don't exist yet.

    Safe to call on every app launch — schema.sql uses IF NOT EXISTS /
    INSERT OR IGNORE throughout, so this never wipes user progress.
    """
    conn = get_connection()
    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        conn.commit()
    finally:
        conn.close()
