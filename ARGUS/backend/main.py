"""ARGUS desktop entry point.

Boots the SQLite database, starts the PyWebView shell pointed at the
built frontend (frontend/dist in production, the Vite dev server in
development), and wires the Api class so React can call into Python.
"""
from __future__ import annotations

import sys
from pathlib import Path

import webview

from backend.database.db import init_db
from backend.api import Api

DEV_URL = "http://localhost:5177"
def resolve_frontend_target() -> str:
    if getattr(sys, 'frozen', False):
        # In PyInstaller onefile mode, resources are unpacked to sys._MEIPASS
        # Note: main.py is placed at the root of _MEIPASS by default
        return str(Path(sys._MEIPASS) / "frontend" / "dist" / "index.html")

    is_dev = "--dev" in sys.argv
    if is_dev:
        return DEV_URL
    return str(Path(__file__).parent.parent / "frontend" / "dist" / "index.html")


def main() -> None:
    init_db()

    api = Api()
    window = webview.create_window(
        title="ARGUS — AEGIS Security Suite",
        url=resolve_frontend_target(),
        js_api=api,
        width=1440,
        height=900,
        min_size=(1100, 700),
        frameless=False,
        easy_drag=False,
    )
    api.set_window(window)

    # Boot the Real-Time NIDS engine in the background
    import json
    from dataclasses import asdict
    from backend.network.sniffer import LiveSniffer
    from backend.engine.orchestrator import run_detection_cycle
    
    def on_packet(event):
        try:
            # Send live packet metric to React graphs
            event_json = json.dumps({
                "source_ip": event.source_ip,
                "destination_ip": event.destination_ip,
                "protocol": event.protocol,
            })
            window.evaluate_js(f"if (window.onLivePacket) window.onLivePacket({event_json})")
            
            # Feed packet into Snort-like rules engine
            new_cases = run_detection_cycle([event])
            
            # Send any triggered alerts to React
            for case in new_cases:
                case_json = json.dumps(asdict(case))
                window.evaluate_js(f"if (window.onNewAlert) window.onNewAlert({case_json})")
        except Exception as e:
            pass # Suppress UI stream errors during shutdown

    sniffer = LiveSniffer(on_packet)
    sniffer.start()

    webview.start(debug="--dev" in sys.argv)
    
    sniffer.stop()


if __name__ == "__main__":
    main()
