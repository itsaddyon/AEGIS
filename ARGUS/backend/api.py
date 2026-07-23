"""API surface exposed to the frontend via window.pywebview.api.

Every method here is callable from React as
window.pywebview.api.<method_name>(...) and must return
JSON-serializable data (pywebview handles the marshalling).
"""
from __future__ import annotations

import json
from dataclasses import asdict

from backend.cases import repository as cases_repo
from backend import vault_reader


class Api:
    # --- AEGIS identity (shared vault.json — no cloud, no IPC) ---
    def get_user_identity(self) -> str:
        """Returns the AEGIS username, read straight from the local vault."""
        return json.dumps({"username": vault_reader.read_username()})

    # --- window controls (bound to the custom TitleBar) ---
    def minimize(self):
        if self._window:
            self._window.minimize()

    def maximize(self):
        if self._window:
            try:
                import ctypes
                hwnd = None
                if hasattr(self._window, 'native') and self._window.native:
                    if hasattr(self._window.native, 'Handle'):
                        hwnd = self._window.native.Handle.ToInt64()
                    elif hasattr(self._window.native, 'hwnd'):
                        hwnd = self._window.native.hwnd
                
                if hwnd:
                    user32 = ctypes.windll.user32
                    if user32.IsZoomed(hwnd):
                        user32.ShowWindow(hwnd, 9)  # SW_RESTORE
                    else:
                        user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
                else:
                    self._window.toggle_fullscreen()
            except Exception:
                self._window.toggle_fullscreen()

    def close(self):
        if self._window:
            self._window.destroy()

    def set_window(self, window):
        self._window = window

    # --- case files ---
    def list_cases(self, status: str | None = None) -> str:
        cases = cases_repo.list_cases(status)
        return json.dumps([asdict(c) for c in cases])

    def get_case(self, case_id: str) -> str | None:
        case = cases_repo.get_case(case_id)
        return json.dumps(asdict(case)) if case else None

    def update_case_status(self, case_id: str, status: str) -> bool:
        cases_repo.update_case_status(case_id, status)
        return True

    def toggle_bookmark(self, case_id: str, bookmarked: bool) -> bool:
        cases_repo.toggle_bookmark(case_id, bookmarked)
        return True

    # --- AEGIS Cross-Launch Services ---
    def _launch_app(self, app_folder: str, app_exe: str):
        import os
        import subprocess
        # Get the root AEGIS folder containing ARGUS, CAST, VISTA
        aegis_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        exe_path = os.path.join(aegis_root, app_folder, "dist", app_exe)
        
        try:
            if os.path.exists(exe_path):
                # Use ShellExecute via os.startfile to allow UAC elevation if needed (VISTA requires it)
                os.startfile(exe_path)
            else:
                # Fallback for development mode: run via python build_exe.py or main.py?
                # For simplicity, we just assume the exe is built or we launch via python backend/main.py
                py_path = os.path.join(aegis_root, app_folder, "backend", "main.py")
                if not os.path.exists(py_path):
                    # VISTA uses run.py
                    py_path = os.path.join(aegis_root, app_folder, "backend", "run.py")
                subprocess.Popen(["python", py_path], cwd=os.path.join(aegis_root, app_folder))
        except Exception as e:
            print(f"Failed to launch {app_exe}: {e}")

    def launch_cast(self):
        self._launch_app("CAST", "CAST.exe")

    def launch_vista(self):
        self._launch_app("VISTA", "VISTA.exe")

    def simulate_attack(self):
        """Injects a burst of malicious packets to demonstrate the NIDS engine."""
        import json
        from datetime import datetime
        from dataclasses import asdict
        from backend.engine.orchestrator import run_detection_cycle
        from backend.engine.base import NetworkEvent

        if not self._window:
            return False

        events = []
        now = datetime.utcnow().isoformat() + "Z"
        
        # 1. Simulate aggressive Port Scan
        for port in [21, 22, 23, 25, 53, 80, 443, 3389, 8080, 8443]:
            events.append(NetworkEvent(
                timestamp=now,
                source_ip="198.51.100.42",
                destination_ip="10.0.0.5",
                port=port,
                protocol="TCP",
                event_type="connection_attempt",
                metadata={"bytes": 64}
            ))
            
        # 2. Simulate RDP Brute Force
        for _ in range(55):
            events.append(NetworkEvent(
                timestamp=now,
                source_ip="203.0.113.88",
                destination_ip="10.0.0.10",
                port=3389,
                protocol="TCP",
                event_type="auth_attempt",
                metadata={"bytes": 128}
            ))

        # Update the live packet graph
        for event in events:
            event_json = json.dumps({
                "source_ip": event.source_ip,
                "destination_ip": event.destination_ip,
                "protocol": event.protocol,
            })
            self._window.evaluate_js(f"if (window.onLivePacket) window.onLivePacket({event_json})")
            
        # Run detection cycle
        new_cases = run_detection_cycle(events)
        
        # Dispatch alerts to frontend
        for case in new_cases:
            case_json = json.dumps(asdict(case))
            self._window.evaluate_js(f"if (window.onNewAlert) window.onNewAlert({case_json})")
            
        return True
