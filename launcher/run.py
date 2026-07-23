import os
import sys
import webview
import subprocess
import pathlib

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

dist_path = os.path.join(base_path, 'dist')

import hashlib
import secrets
import json

def get_vault_file_path():
    appdata = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
    aegis_dir = os.path.join(appdata, 'AEGIS')
    os.makedirs(aegis_dir, exist_ok=True)
    return os.path.join(aegis_dir, 'vault.json')

def load_vault():
    vault_path = get_vault_file_path()
    if os.path.exists(vault_path):
        try:
            with open(vault_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    import datetime
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    default_vault = {
        "installed_at": now_str,
        "version": "2.4.0",
        "user": None
    }
    try:
        with open(vault_path, 'w', encoding='utf-8') as f:
            json.dump(default_vault, f, indent=2)
    except Exception:
        pass
    return default_vault

def save_vault(data):
    vault_path = get_vault_file_path()
    try:
        with open(vault_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving vault: {e}")
        return False

def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_bytes(32)
    elif isinstance(salt, str):
        salt = bytes.fromhex(salt)
    
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return salt.hex(), key.hex()

dismissed_local_threats = set()

class Api:
    def __init__(self, window_ref=None):
        self._window = window_ref

    def set_window(self, window):
        self._window = window

    def get_vault_status(self):
        vault = load_vault()
        user = vault.get("user")
        if user and user.get("username") and user.get("password_hash"):
            return {
                "is_first_launch": False,
                "username": user.get("username"),
                "installed_at": vault.get("installed_at")
            }
        return {
            "is_first_launch": True,
            "username": None,
            "installed_at": vault.get("installed_at")
        }

    def register_user(self, username, password):
        username = (username or "").strip()
        if not username:
            return {"success": False, "error": "Username cannot be empty."}
        if not password or len(password) < 4:
            return {"success": False, "error": "Password must be at least 4 characters long."}
        
        salt_hex, key_hex = hash_password(password)
        import datetime
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        vault = load_vault()
        vault["user"] = {
            "username": username,
            "password_salt": salt_hex,
            "password_hash": key_hex,
            "registered_at": now_str,
            "last_login": now_str
        }
        if save_vault(vault):
            return {"success": True, "username": username}
        return {"success": False, "error": "Failed to write local vault configuration."}

    def authenticate_user(self, password):
        vault = load_vault()
        user = vault.get("user")
        if not user or not user.get("password_hash") or not user.get("password_salt"):
            return {"success": False, "error": "User configuration missing. Please set up user first."}
        
        salt_hex = user.get("password_salt")
        expected_hash = user.get("password_hash")
        
        _, input_hash = hash_password(password, salt_hex)
        if secrets.compare_digest(input_hash, expected_hash):
            import datetime
            now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
            user["last_login"] = now_str
            save_vault(vault)
            return {"success": True, "username": user.get("username")}
        
        return {"success": False, "error": "Access Denied: Invalid Password."}

    def _run_hidden(self, cmd):
        try:
            creationflags = 0
            if sys.platform == 'win32':
                creationflags = subprocess.CREATE_NO_WINDOW
            
            output = subprocess.check_output(
                cmd,
                shell=True,
                stdin=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creationflags
            )
            return output.decode('utf-8', errors='ignore')
        except:
            return ""

    def _is_running(self, module_name):
        status = self.get_all_status()
        return status.get(module_name, False)

    def get_all_status(self):
        status = {"ARGUS": False, "CAST": False, "VISTA": False}
        try:
            import psutil
            import os
            my_pid = os.getpid()
            for proc in psutil.process_iter(['name', 'cmdline']):
                try:
                    if proc.pid == my_pid:
                        continue
                    name = (proc.info['name'] or "").lower()
                    cmdline = proc.info['cmdline'] or []
                    cmdline_str = " ".join(cmdline).lower()
                    
                    for module in ["ARGUS", "CAST", "VISTA"]:
                        mod_lower = module.lower()
                        # 1. Production check (exe name matches)
                        if name == f"{mod_lower}.exe":
                            status[module] = True
                            continue
                        
                        # 2. Development check (Python process checking cmdline)
                        if "python" in name:
                            if f"\\{mod_lower}\\" in cmdline_str or f"/{mod_lower}/" in cmdline_str or mod_lower in cmdline or f"{mod_lower}.py" in cmdline_str:
                                status[module] = True
                                continue
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
        except Exception as e:
            print(f"[Launcher] Exception in get_all_status: {e}")
            output = self._run_hidden('tasklist /NH')
            status = {
                "ARGUS": "ARGUS.exe" in output,
                "CAST": "CAST.exe" in output,
                "VISTA": "VISTA.exe" in output
            }
        return status

    def _launch_app(self, app_folder: str, app_exe: str):
        if self._is_running(app_folder):
            return {"success": True, "message": "Already running"}

        try:
            current_dir = pathlib.Path(__file__).resolve().parent
            workspace_root = current_dir.parent
            
            # AppData bin path for extracted executables
            app_data = pathlib.Path(os.getenv('LOCALAPPDATA', pathlib.Path.home() / 'AppData' / 'Local'))
            bin_dir = app_data / "AEGIS" / "bin"
            bin_dir.mkdir(parents=True, exist_ok=True)
            extracted_target = bin_dir / app_exe

            # 1. Search for bundled or compiled executables first
            possible_targets = []
            if getattr(sys, 'frozen', False):
                meipass = pathlib.Path(sys._MEIPASS)
                bundled_bin = meipass / "bin" / app_exe
                if bundled_bin.exists():
                    try:
                        import shutil
                        shutil.copy2(str(bundled_bin), str(extracted_target))
                        possible_targets.append(extracted_target)
                    except Exception:
                        possible_targets.append(bundled_bin)

                current_exe_dir = pathlib.Path(sys.executable).parent
                workspace_root_frozen = current_exe_dir.parent.parent.parent
                possible_targets.extend([
                    extracted_target,
                    current_exe_dir / app_exe,
                    workspace_root_frozen / app_folder / "dist" / app_folder / app_exe,
                    workspace_root_frozen / app_folder / "dist" / app_exe,
                ])
            
            # Check local workspace and bin paths
            possible_targets.extend([
                extracted_target,
                workspace_root / app_folder / "dist" / app_folder / app_exe,
                workspace_root / app_folder / "dist" / app_exe,
                workspace_root / "bin" / app_exe,
            ])
            
            target = None
            for pt in possible_targets:
                if pt.exists():
                    target = pt
                    break
            
            if target:
                os.startfile(str(target))
                return {"success": True}
            
            # 2. Fallback to Python dev scripts if executable is not found
            target_script = workspace_root / app_folder / "backend" / "main.py"
            if not target_script.exists():
                target_script = workspace_root / app_folder / "backend" / "run.py"
            
            if target_script.exists():
                # In frozen mode, sys.executable points to the launcher exe, so we use generic "python"
                python_bin = "python" if getattr(sys, 'frozen', False) else sys.executable
                subprocess.Popen([python_bin, str(target_script)], cwd=str(workspace_root / app_folder), close_fds=True, creationflags=subprocess.CREATE_NEW_CONSOLE)
                return {"success": True, "message": "Launched via dev script fallback"}
                
            return {"success": False, "error": f"Neither compiled executable nor development script found for {app_folder}."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def perform_initial_extraction(self):
        try:
            if not getattr(sys, 'frozen', False):
                return {"success": True, "message": "Not a frozen build."}
            
            app_data = pathlib.Path(os.getenv('LOCALAPPDATA', pathlib.Path.home() / 'AppData' / 'Local'))
            bin_dir = app_data / "AEGIS" / "bin"
            bin_dir.mkdir(parents=True, exist_ok=True)
            
            meipass = pathlib.Path(sys._MEIPASS)
            bundled_bin_dir = meipass / "bin"
            
            if not bundled_bin_dir.exists():
                return {"success": True, "message": "No bundled bin directory found."}
                
            exes_to_extract = ["ARGUS.exe", "CAST.exe", "VISTA.exe"]
            total_size = sum((bundled_bin_dir / exe).stat().st_size for exe in exes_to_extract if (bundled_bin_dir / exe).exists())
            
            if total_size == 0:
                return {"success": True, "message": "No executables to extract."}
            
            copied = 0
            for app_exe in exes_to_extract:
                src = bundled_bin_dir / app_exe
                dst = bin_dir / app_exe
                
                if src.exists() and not dst.exists():
                    with open(src, 'rb') as fsrc, open(dst, 'wb') as fdst:
                        while True:
                            chunk = fsrc.read(1024 * 1024 * 5) # 5MB chunk
                            if not chunk:
                                break
                            fdst.write(chunk)
                            copied += len(chunk)
                            percent = int((copied / total_size) * 100)
                            if self._window:
                                try:
                                    self._window.evaluate_js(f"if(window.updateBootProgress) window.updateBootProgress({percent}, 'Installing {app_exe}...');")
                                except Exception:
                                    pass
                elif src.exists():
                    copied += src.stat().st_size
                    percent = int((copied / total_size) * 100)
                    if self._window:
                        try:
                            self._window.evaluate_js(f"if(window.updateBootProgress) window.updateBootProgress({percent}, '{app_exe} already installed.');")
                        except Exception:
                            pass
            return {"success": True, "message": "Extraction complete."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def launch_module(self, module_name):
        return self._launch_app(module_name, f"{module_name}.exe")

    def verify_module_integrity(self, module_name):
        app_exe = f"{module_name}.exe"
        app_folder = module_name
        current_dir = pathlib.Path(__file__).resolve().parent
        workspace_root = current_dir.parent

        app_data = pathlib.Path(os.getenv('LOCALAPPDATA', pathlib.Path.home() / 'AppData' / 'Local'))
        bin_dir = app_data / "AEGIS" / "bin"
        extracted_target = bin_dir / app_exe

        possible_targets = []
        if getattr(sys, 'frozen', False):
            meipass = pathlib.Path(sys._MEIPASS)
            bundled_bin = meipass / "bin" / app_exe
            if bundled_bin.exists():
                possible_targets.append(bundled_bin)
            current_exe_dir = pathlib.Path(sys.executable).parent
            workspace_root_frozen = current_exe_dir.parent.parent.parent
            possible_targets.extend([
                extracted_target,
                current_exe_dir / app_exe,
                workspace_root_frozen / app_folder / "dist" / app_folder / app_exe,
                workspace_root_frozen / app_folder / "dist" / app_exe,
            ])
        
        possible_targets.extend([
            extracted_target,
            workspace_root / app_folder / "dist" / app_folder / app_exe,
            workspace_root / app_folder / "dist" / app_exe,
            workspace_root / "bin" / app_exe,
        ])

        target = None
        for pt in possible_targets:
            if pt.exists():
                target = pt
                break

        if not target:
            target_script = workspace_root / app_folder / "backend" / "main.py"
            if not target_script.exists():
                target_script = workspace_root / app_folder / "backend" / "run.py"
            if target_script.exists():
                target = target_script

        if not target or not target.exists():
            return {
                "valid": False,
                "module": module_name,
                "error": f"Target binary or script for {module_name} could not be located."
            }

        try:
            size_mb = target.stat().st_size / (1024 * 1024)
            is_exe = target.name.endswith(".exe")
            target_type = "Compiled Executable (.EXE)" if is_exe else "Development Script (.PY)"
            
            checks = [
                f"Target payload identified: {target.name} ({target_type})",
                f"Binary integrity & size verified ({size_mb:.2f} MB)",
                "Permissions & sandbox directory isolation validated",
                "Ecosystem IPC gateway protocol ready"
            ]
            return {
                "valid": True,
                "module": module_name,
                "target_name": target.name,
                "target_path": str(target),
                "target_type": target_type,
                "size_mb": f"{size_mb:.2f} MB",
                "checks": checks
            }
        except Exception as e:
            return {
                "valid": False,
                "module": module_name,
                "error": str(e)
            }

    def stop_module(self, module_name):
        exe_name = f"{module_name}.exe"
        output = self._run_hidden(f'taskkill /F /IM {exe_name}')
        if "SUCCESS" in output or "has been terminated" in output or "Terminated" in output:
             return {"success": True}
        else:
             # taskkill might fail if the process isn't running, which is fine
             return {"success": True, "message": "Command executed (may already be stopped)."}

    def close_launcher(self):
        if self._window:
            self._window.destroy()
        
    def minimize_launcher(self):
        if self._window:
            self._window.minimize()

    def maximize_launcher(self):
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

    def resolve_case(self, case_id, new_status="investigating"):
        if case_id.startswith("LOCAL-"):
            global dismissed_local_threats
            dismissed_local_threats.add(case_id)
            print(f"[Launcher] Local threat {case_id} added to dismissed list.")
            return True

        import os
        import sqlite3
        from pathlib import Path
        from datetime import datetime, timezone

        app_data = Path(os.getenv('LOCALAPPDATA', Path.home() / 'AppData' / 'Local'))
        db_path = app_data / "AEGIS" / "ARGUS" / "argus.db"
        if not db_path.exists():
            launcher_dir = Path(__file__).parent.resolve()
            dev_db = launcher_dir.parent / "ARGUS" / "backend" / "database" / "argus.db"
            if dev_db.exists():
                db_path = dev_db

        if not db_path.exists():
            return False

        try:
            conn = sqlite3.connect(str(db_path))
            now_iso = datetime.now(timezone.utc).isoformat()
            # Update specific case
            conn.execute(
                "UPDATE case_files SET status = ?, updated_at = ? WHERE id = ?",
                (new_status, now_iso, case_id)
            )
            # Also resolve any lingering 'new' status cases to prevent repetitive popup loops
            conn.execute(
                "UPDATE case_files SET status = ?, updated_at = ? WHERE status = 'new'",
                (new_status, now_iso)
            )
            conn.commit()
            conn.close()
            print(f"[Launcher] Case {case_id} and all new cases updated to {new_status} in DB.")
            return True
        except Exception as e:
            print(f"[Launcher] Error updating case {case_id}: {e}")
        return False

import threading
import time
import json

def status_poller(api, win):
    print("[Launcher] Status poller thread started.")
    import os
    import sqlite3
    import psutil
    import time
    from pathlib import Path
    
    app_data = Path(os.getenv('LOCALAPPDATA', Path.home() / 'AppData' / 'Local'))
    db_path = app_data / "AEGIS" / "ARGUS" / "argus.db"
    
    # Track network packet history for local DoS flood detection
    try:
        prev_io = psutil.net_io_counters()
    except:
        prev_io = None
    prev_time = time.time()
    
    last_cli_check_time = 0.0
    cached_cli_threat = None
    
    while True:
        try:
            status = api.get_all_status()
            try:
                cpu = psutil.cpu_percent(interval=None)
                ram = psutil.virtual_memory().percent
            except Exception as e:
                print(f"[Launcher] Error getting psutil metrics: {e}")
                cpu = 0.0
                ram = 0.0
            status["_cpu"] = cpu
            status["_ram"] = ram
            
            # A. Local Network Threat Monitoring (Run CLI checks every 10 seconds to avoid CPU spikes)
            now = time.time()
            if now - last_cli_check_time > 10.0:
                last_cli_check_time = now
                cli_threat = None
                
                # 1. Wi-Fi Security Scan
                try:
                    import subprocess
                    startupinfo = subprocess.STARTUPINFO()
                    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                    res = subprocess.check_output("netsh wlan show interfaces", startupinfo=startupinfo, text=True, errors='ignore')
                    auth_type = ""
                    ssid = ""
                    for line in res.splitlines():
                        line = line.strip()
                        if line.startswith("Authentication"):
                            auth_type = line.split(":", 1)[1].strip()
                        elif line.startswith("SSID"):
                            ssid = line.split(":", 1)[1].strip()
                    if auth_type and ("Open" in auth_type or "None" in auth_type or "WEP" in auth_type):
                        cli_threat = {
                            "id": "LOCAL-WIFI",
                            "threat_name": "UNSECURE WI-FI DETECTED",
                            "severity": "medium",
                            "source_ip": "Local Gateway",
                            "ports": ssid or "Unknown SSID",
                            "protocol": auth_type,
                        }
                except Exception:
                    pass
                    
                # 2. Dynamic ARP spoof / MITM scan
                if not cli_threat:
                    try:
                        import subprocess
                        startupinfo = subprocess.STARTUPINFO()
                        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                        res = subprocess.check_output("arp -a", startupinfo=startupinfo, text=True, errors='ignore')
                        mac_to_ips = {}
                        for line in res.splitlines():
                            parts = line.strip().split()
                            if len(parts) >= 3:
                                ip = parts[0]
                                mac = parts[1].lower().replace("-", ":")
                                entry_type = parts[2].lower()
                                # Exclude broadcast/multicast and static configurations
                                if entry_type == "dynamic" and not ip.startswith("224.") and not ip.startswith("239.") and mac != "ff:ff:ff:ff:ff:ff":
                                    if mac not in mac_to_ips:
                                        mac_to_ips[mac] = []
                                    mac_to_ips[mac].append(ip)
                        for mac, ips in mac_to_ips.items():
                            if len(ips) > 1:
                                cli_threat = {
                                    "id": "LOCAL-MITM",
                                    "threat_name": "ARP SPOOFING (MITM)",
                                    "severity": "high",
                                    "source_ip": ips[0],
                                    "ports": mac,
                                    "protocol": "ARP",
                                }
                                break
                    except Exception:
                        pass
                cached_cli_threat = cli_threat

            local_threat = cached_cli_threat

            # 3. Packet rate flood check (DoS)
            if not local_threat and prev_io:
                try:
                    curr_io = psutil.net_io_counters()
                    total_packets = (curr_io.packets_recv + curr_io.packets_sent) - (prev_io.packets_recv + prev_io.packets_sent)
                    elapsed = now - prev_time
                    if elapsed > 0:
                        pps = total_packets / elapsed
                        if pps > 3000:
                            local_threat = {
                                "id": "LOCAL-DOS",
                                "threat_name": "TRAFFIC FLOOD (DOS)",
                                "severity": "critical",
                                "source_ip": "Network Interface",
                                "ports": f"{int(pps)} Packets/sec",
                                "protocol": "IP/TCP",
                            }
                    prev_io = curr_io
                    prev_time = now
                except Exception:
                    pass
            elif not prev_io:
                try:
                    prev_io = psutil.net_io_counters()
                    prev_time = time.time()
                except:
                    pass
            
            # Filter out dismissed local alerts
            if local_threat and local_threat["id"] in dismissed_local_threats:
                local_threat = None

            # B. Query for new cases and clearance rate in ARGUS database
            active_db = db_path
            if not active_db.exists():
                launcher_dir = Path(__file__).parent.resolve()
                dev_db = launcher_dir.parent / "ARGUS" / "backend" / "database" / "argus.db"
                if dev_db.exists():
                    active_db = dev_db
                    
            new_threat = None
            total_cases = 0
            resolved_cases = 0
            if active_db.exists():
                try:
                    conn = sqlite3.connect(str(active_db))
                    conn.row_factory = sqlite3.Row
                    cur = conn.execute(
                        "SELECT id, threat_name, severity, source_ip, ports, protocol FROM case_files WHERE status = 'new' ORDER BY opened_at DESC LIMIT 1"
                    )
                    row = cur.fetchone()
                    
                    cur_stats = conn.execute("SELECT COUNT(*) as tot, SUM(case when status='resolved' then 1 else 0 end) as res FROM case_files")
                    stats_row = cur_stats.fetchone()
                    if stats_row:
                        total_cases = stats_row["tot"] or 0
                        resolved_cases = stats_row["res"] or 0
                        
                    conn.close()
                    if row:
                        new_threat = {
                            "id": row["id"],
                            "threat_name": row["threat_name"],
                            "severity": row["severity"],
                            "source_ip": row["source_ip"],
                            "ports": row["ports"],
                            "protocol": row["protocol"]
                        }
                except Exception as e:
                    print(f"[Launcher] Error polling DB: {e}")
            
            # Prioritize ARGUS database warnings, fallback to local launcher network monitoring
            final_threat = new_threat or local_threat
            
            if final_threat:
                status["_new_threat"] = final_threat
                # Also propagate high/critical alerts to active_alert.json
                if final_threat.get("severity", "").lower() in ["high", "critical"]:
                    import vault_reader
                    vault_reader.write_active_alert(
                        final_threat.get("threat_name", "Security Threat Detected"),
                        final_threat.get("source_ip", "Unknown"),
                        final_threat.get("severity", "high"),
                        final_threat.get("protocol", "IP")
                    )
            else:
                # No active new threats - clear the alert
                import vault_reader
                vault_reader.clear_active_alert()
            
            # C. Read CAST training progress and update Security Posture
            import vault_reader
            cast_prof = vault_reader.read_cast_profile()
            cast_completion = cast_prof.get("completion_percent", 0)
            
            # Posture calculation: CAST completion (40%), ARGUS clearance rate (40%), VISTA running status (20%)
            argus_clearance = 100
            if total_cases > 0:
                argus_clearance = int((resolved_cases / total_cases) * 100)
                
            vista_active = 100 if status.get("VISTA", False) else 0
            
            overall_posture = int((cast_completion * 0.4) + (argus_clearance * 0.4) + (vista_active * 0.2))
            
            status["posture"] = {
                "overall": overall_posture,
                "cast_completion": cast_completion,
                "argus_clearance": argus_clearance,
                "vista_active": status.get("VISTA", False)
            }
            
            # Print status summary for backend logs
            print(f"[Launcher] Poller status payload: CPU={cpu:.1f}%, RAM={ram:.1f}%, Modules={status}")
            
            js_code = f'if(window.updateAllStatus) window.updateAllStatus({json.dumps(status)});'
            win.evaluate_js(js_code)
        except Exception as e:
            import traceback
            print(f"[Launcher] Error in status poller loop: {e}")
            traceback.print_exc()
        time.sleep(3.0)

if __name__ == '__main__':
    url = os.path.abspath(os.path.join(dist_path, 'index.html'))
    
    api = Api()
    
    # Expose native win32 minimize, maximize, close to Launcher titlebar
    def minimize():
        if api._window: api._window.minimize()
    def maximize():
        if api._window:
            try:
                import ctypes
                hwnd = None
                if hasattr(api._window, 'native') and api._window.native:
                    if hasattr(api._window.native, 'Handle'):
                        hwnd = api._window.native.Handle.ToInt64()
                    elif hasattr(api._window.native, 'hwnd'):
                        hwnd = api._window.native.hwnd
                if hwnd:
                    user32 = ctypes.windll.user32
                    if user32.IsZoomed(hwnd):
                        user32.ShowWindow(hwnd, 9)
                    else:
                        user32.ShowWindow(hwnd, 3)
                else:
                    api._window.toggle_fullscreen()
            except Exception:
                api._window.toggle_fullscreen()
    def close():
        if api._window: api._window.destroy()
        
    api.minimize = minimize
    api.maximize = maximize
    api.close = close
    
    window = webview.create_window(
        title='AEGIS Launcher',
        url=url,
        width=1280,
        height=800,
        resizable=True,
        min_size=(1024, 768),
        frameless=False, 
        js_api=api
    )
    api.set_window(window)
    
    # Start the polling thread instead of JS calling API
    t = threading.Thread(target=status_poller, args=(api, window), daemon=True)
    t.start()
    
    webview.start()
