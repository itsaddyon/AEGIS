"""CAST desktop shell entry point.

Boots the local SQLite database, remembers the last window size, shows a
short native splash, then opens the PyWebView window pointed at the built
React frontend (frontend/dist).
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import webview

if getattr(sys, 'frozen', False):
    ROOT = Path(sys._MEIPASS)
    WINDOW_STATE_PATH = Path(sys.executable).parent / ".window_state.json"
else:
    ROOT = Path(__file__).resolve().parent.parent
    WINDOW_STATE_PATH = ROOT / "backend" / ".window_state.json"

sys.path.insert(0, str(ROOT))  # let `database`, `services`, `modules` resolve

from database.db import init_db  # noqa: E402

FRONTEND_DIST = ROOT / "frontend" / "dist" / "index.html"
DEFAULT_WINDOW = {"width": 1280, "height": 800}


def load_window_state() -> dict:
    if WINDOW_STATE_PATH.exists():
        try:
            return json.loads(WINDOW_STATE_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            pass
    return DEFAULT_WINDOW


def save_window_state(window: "webview.Window") -> None:
    try:
        WINDOW_STATE_PATH.write_text(
            json.dumps({"width": window.width, "height": window.height})
        )
    except OSError:
        pass


def main() -> None:
    init_db()

    if not FRONTEND_DIST.exists():
        print(
            "frontend/dist/index.html not found.\n"
            "Run:  cd frontend && npm install && npm run build\n"
            "...then re-run this script."
        )
        sys.exit(1)

    from backend.api import Api

    state = load_window_state()
    api = Api()

    window = webview.create_window(
        title="CAST — Cyber Awareness Simulation Trainer",
        url=str(FRONTEND_DIST),
        js_api=api,
        width=state["width"],
        height=state["height"],
        min_size=(1024, 680),
        background_color="#1E1E1C",  # warm charcoal, avoids a white flash
    )

    api.set_window(window)
    window.events.closed += lambda: save_window_state(window)

    webview.start(debug=False)


if __name__ == "__main__":
    main()
