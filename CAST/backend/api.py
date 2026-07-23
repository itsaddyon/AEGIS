"""The Api class exposed to the React frontend via window.pywebview.api.

Every method here returns plain JSON-serializable dicts/lists so it can be
called directly from TypeScript (see frontend/src/lib/api.ts).
"""
from __future__ import annotations

import json

from database.db import get_connection
from modules.achievements import check_and_award
from services import certificate_service, progress_service
from services.gamification_service import award_xp
try:
    from backend import vault_reader
except ImportError:
    try:
        from services import vault_reader
    except ImportError:
        import vault_reader


class Api:
    def set_window(self, window):
        self._window = window

    # --- AEGIS identity (shared vault.json — no cloud, no IPC) ---
    def get_user_identity(self) -> str:
        """Returns the AEGIS username, read straight from the local vault."""
        return json.dumps({"username": vault_reader.read_username()})

    # --- AEGIS cross-app threat alert (written by ARGUS on HIGH/CRITICAL cases) ---
    def get_active_alert(self) -> dict:
        return vault_reader.read_active_alert()

    def minimize(self):
        if hasattr(self, '_window') and self._window:
            self._window.minimize()

    def maximize(self):
        if hasattr(self, '_window') and self._window:
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
        if hasattr(self, '_window') and self._window:
            self._window.destroy()

    # ---- Profile / dashboard ------------------------------------------------
    def get_profile(self) -> dict:
        conn = get_connection()
        try:
            row = conn.execute("SELECT * FROM user_profile WHERE id = 1").fetchone()
            profile = dict(row)
            # Auto-sync AEGIS vault username → local user_id (login identity,
            # kept separate from display_name/"CERT NAME" used on certificates).
            aegis_username = vault_reader.read_username()
            if aegis_username and profile.get("user_id") != aegis_username:
                conn.execute("UPDATE user_profile SET user_id = ? WHERE id = 1", (aegis_username,))
                conn.commit()
                profile["user_id"] = aegis_username
            profile["aegis_username"] = aegis_username
            return profile
        finally:
            conn.close()

    def update_display_name(self, name: str) -> dict:
        conn = get_connection()
        try:
            conn.execute("UPDATE user_profile SET display_name = ? WHERE id = 1", (name,))
            conn.commit()
        finally:
            conn.close()
        return self.get_profile()

    def set_theme(self, theme: str) -> dict:
        conn = get_connection()
        try:
            conn.execute("UPDATE user_profile SET theme = ? WHERE id = 1", (theme,))
            conn.commit()
        finally:
            conn.close()
        return self.get_profile()

    # ---- Suite Integration: launch VISTA -----------------------------------
    def launch_vista(self) -> dict:
        """Launch the standalone VISTA app as a separate process.

        Mirrors VISTA's own launch_cast route: tries the frozen .exe first
        (same dir, parent dir, adjacent dist folder), then falls back to
        running VISTA's dev entry script with the current Python interpreter.
        """
        import sys
        from pathlib import Path
        import subprocess

        exe_name = "VISTA.exe"
        dev_script_path = "VISTA/backend/run.py"

        def _launch_exe(exe_path: Path):
            # VISTA.exe is built with a requireAdministrator manifest (needed
            # for live packet capture). subprocess.Popen uses CreateProcess
            # directly and fails with WinError 740 ("requires elevation") for
            # such executables. os.startfile (and ShellExecute as a fallback)
            # goes through the shell, which honors the manifest and shows the
            # UAC prompt correctly instead of erroring out.
            import os
            try:
                os.startfile(str(exe_path))  # noqa: S606 (Windows-only, intentional)
            except AttributeError:
                import ctypes
                ctypes.windll.shell32.ShellExecuteW(None, "open", str(exe_path), None, str(exe_path.parent), 1)

        try:
            if getattr(sys, 'frozen', False):
                current_exe_dir = Path(sys.executable).parent

                target = current_exe_dir / exe_name
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_same_dir"}

                target = current_exe_dir.parent / exe_name
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_parent_dir"}

                target = current_exe_dir.parent.parent / "VISTA" / "dist" / "VISTA.exe"
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_adjacent_dist"}

                return {"success": False, "error": f"Executable {exe_name} not found."}
            else:
                # Development mode: CAST/backend/api.py -> up 2 levels -> workspace root
                current_dir = Path(__file__).resolve().parent
                workspace_root = current_dir.parent.parent

                python_exe = sys.executable
                target_script = workspace_root / dev_script_path
                if target_script.exists():
                    subprocess.Popen([python_exe, str(target_script)], cwd=str(workspace_root / "VISTA"), close_fds=True)
                    return {"success": True, "mode": "dev_script"}

                adjacent_exe = workspace_root / "VISTA" / "dist" / "VISTA.exe"
                if adjacent_exe.exists():
                    _launch_exe(adjacent_exe)
                    return {"success": True, "mode": "dev_adjacent_exe"}

                return {"success": False, "error": f"Dev script or EXE not found under {workspace_root}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def launch_argus(self) -> dict:
        """Launch the standalone ARGUS app as a separate process."""
        import sys
        from pathlib import Path
        import subprocess

        exe_name = "ARGUS.exe"
        dev_script_path = "ARGUS/backend/main.py"

        def _launch_exe(exe_path: Path):
            import os
            try:
                os.startfile(str(exe_path))  # noqa: S606
            except AttributeError:
                import ctypes
                ctypes.windll.shell32.ShellExecuteW(None, "open", str(exe_path), None, str(exe_path.parent), 1)

        try:
            if getattr(sys, 'frozen', False):
                current_exe_dir = Path(sys.executable).parent

                target = current_exe_dir / exe_name
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_same_dir"}

                target = current_exe_dir.parent / exe_name
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_parent_dir"}

                target = current_exe_dir.parent.parent / "ARGUS" / "dist" / "ARGUS.exe"
                if target.exists():
                    _launch_exe(target)
                    return {"success": True, "mode": "frozen_adjacent_dist"}

                return {"success": False, "error": f"Executable {exe_name} not found."}
            else:
                current_dir = Path(__file__).resolve().parent
                workspace_root = current_dir.parent.parent

                python_exe = sys.executable
                target_script = workspace_root / dev_script_path
                if target_script.exists():
                    subprocess.Popen([python_exe, str(target_script)], cwd=str(workspace_root / "ARGUS"), close_fds=True)
                    return {"success": True, "mode": "dev_script"}

                adjacent_exe = workspace_root / "ARGUS" / "dist" / "ARGUS.exe"
                if adjacent_exe.exists():
                    _launch_exe(adjacent_exe)
                    return {"success": True, "mode": "dev_adjacent_exe"}

                return {"success": False, "error": f"Dev script or EXE not found under {workspace_root}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ---- Learning Path --------------------------------------------------
    def get_missions(self) -> list[dict]:
        return progress_service.get_all_mission_progress()

    def complete_mission(self, mission_id: str, quiz_score: int) -> dict:
        gam = progress_service.complete_mission(mission_id, quiz_score)
        newly_earned = check_and_award("mission_complete", {"mission_id": mission_id})
        if gam.get("streakDays", 0) >= 7:
            newly_earned += check_and_award("streak", {"streak_days": gam["streakDays"]})
        gam["newlyEarnedAchievements"] = newly_earned
        return gam

    # ---- Practice Lab -----------------------------------------------------
    def get_simulations(self) -> list[dict]:
        conn = get_connection()
        try:
            rows = conn.execute("""
                SELECT s.*, 
                       (SELECT COUNT(*) FROM simulation_attempts a WHERE a.simulation_id = s.id) as attempt_count
                FROM simulations s
            """).fetchall()
            order = ['fake-inbox', 'real-vs-fake-site', 'qr-scanner', 'otp-scam', 'phone-call', 'usb-attack', 'social-chat', 'browser-warning', 'password-lab']
            sims = [dict(r) for r in rows]
            sims.sort(key=lambda x: order.index(x['id']) if x['id'] in order else 999)
            return sims
        finally:
            conn.close()


    def submit_simulation_result(self, simulation_id: str, correct: int, total: int) -> dict:
        gam = progress_service.record_simulation_attempt(simulation_id, correct, total)
        newly_earned = check_and_award(
            "simulation_attempt",
            {"simulation_id": simulation_id, "correct": correct, "total": total},
        )
        gam["newlyEarnedAchievements"] = newly_earned
        return gam

    # ---- Achievements / Progress / Activity --------------------------------
    def get_achievements(self) -> list[dict]:
        conn = get_connection()
        try:
            rows = conn.execute(
                """SELECT a.id, a.title, a.description, a.icon,
                          ua.earned_at
                   FROM achievements a
                   LEFT JOIN user_achievements ua ON ua.achievement_id = a.id"""
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_recent_activity(self) -> list[dict]:
        return progress_service.get_recent_activity()

    # ---- Certificates -------------------------------------------------------
    def issue_certificate(self, display_name: str, final_score: int, dev_bypass: bool = False) -> dict:
        return certificate_service.issue_certificate(display_name, final_score, dev_bypass)

    def list_certificates(self) -> list[dict]:
        return certificate_service.list_certificates()

    # ---- Daily challenge ------------------------------------------------------
    def get_daily_challenge(self) -> dict:
        import datetime as dt
        conn = get_connection()
        try:
            today = dt.date.today().isoformat()
            row = conn.execute(
                "SELECT * FROM daily_challenges WHERE challenge_date = ?", (today,)
            ).fetchone()
            if row:
                return dict(row)
            sim = conn.execute(
                "SELECT id FROM simulations WHERE is_available = 1 ORDER BY RANDOM() LIMIT 1"
            ).fetchone()
            conn.execute(
                "INSERT INTO daily_challenges (challenge_date, simulation_id) VALUES (?, ?)",
                (today, sim["id"]),
            )
            conn.commit()
            return {"challenge_date": today, "simulation_id": sim["id"], "completed": 0}
        finally:
            conn.close()
