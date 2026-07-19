"""
In-memory packet store for the current capture session.

This is intentionally the ONLY place that knows packets are stored as a
deque in RAM. Swapping to SQLite/Postgres later means rewriting this
file only — routes/sockets/capture never touch storage directly.
"""
import threading
from collections import deque
from app.config import config


class SessionManager:
    def __init__(self, max_size: int = None):
        self._buffer = deque(maxlen=max_size or config.MAX_PACKET_BUFFER)
        self._lock = threading.Lock()

    def add(self, packet: dict):
        with self._lock:
            self._buffer.append(packet)

    def all(self) -> list[dict]:
        with self._lock:
            return list(self._buffer)

    def clear(self):
        with self._lock:
            self._buffer.clear()

    def count(self) -> int:
        with self._lock:
            return len(self._buffer)

    def protocol_breakdown(self) -> dict:
        with self._lock:
            breakdown: dict[str, int] = {}
            for pkt in self._buffer:
                breakdown[pkt["protocol"]] = breakdown.get(pkt["protocol"], 0) + 1
            return breakdown


session_manager = SessionManager()
