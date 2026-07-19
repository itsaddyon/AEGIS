"""SQLite connection layer for ARGUS.

Kept deliberately thin — a single connection factory and a schema
initializer — so this module can later be swapped for a Postgres
driver (psycopg) without touching call sites in engine/ or cases/.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path
from contextlib import contextmanager

import sys

if getattr(sys, 'frozen', False):
    import os
    # Store DB in user's AppData folder to guarantee write permissions
    app_data = Path(os.getenv('LOCALAPPDATA', Path.home() / 'AppData' / 'Local'))
    db_dir = app_data / "AEGIS" / "ARGUS"
    db_dir.mkdir(parents=True, exist_ok=True)
    DB_PATH = db_dir / "argus.db"
    SCHEMA_PATH = Path(sys._MEIPASS) / "database" / "schema.sql"
else:
    DB_PATH = Path(__file__).parent / "argus.db"
    SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def init_db() -> None:
    """Create tables if they don't exist yet. Safe to call on every startup."""
    with get_connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.commit()


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
