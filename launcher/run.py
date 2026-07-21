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

dismissed_local_threats = set()

class Api:
    def __init__(self, window_ref=None):
        self._window = window_ref

    def set_window(self, window):
        self._window = window

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
                        
                        # 2. Development check (Python process checking cmdline or cwd)
                        if "python" in name:
                            if f"\\{mod_lower}\\" in cmdline_str or f"/{mod_lower}/" in cmdline_str or mod_lower in cmdline:
                                status[module] = True
                                continue
                            try:
                                cwd = proc.cwd().lower()
                                if f"\\{mod_lower}" in cwd or f"/{mod_lower}" in cwd or cwd.endswith(mod_lower):
                                    status[module] = True
                            except (psutil.AccessDenied, psutil.NoSuchProcess):
                                pass
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
            
            # 1. Search for compiled executables first
            possible_targets = []
            if getattr(sys, 'frozen', False):
                current_exe_dir = pathlib.Path(sys.executable).parent
                workspace_root_frozen = current_exe_dir.parent.parent.parent
                possible_targets.extend([
                    workspace_root_frozen / app_folder / "dist" / app_folder / app_exe,
                    workspace_root_frozen / app_folder / "dist" / app_exe,
                    current_exe_dir / app_exe
                ])
            
            # Also check the local workspace paths directly
            possible_targets.extend([
                workspace_root / app_folder / "dist" / app_folder / app_exe,
                workspace_root / app_folder / "dist" / app_exe,
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

    def launch_module(self, module_name):
        return self._launch_app(module_name, f"{module_name}.exe")

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
            conn.execute(
                "UPDATE case_files SET status = ?, updated_at = ? WHERE id = ?",
                (new_status, datetime.now(timezone.utc).isoformat(), case_id)
            )
            conn.commit()
            conn.close()
            print(f"[Launcher] Case {case_id} status updated to {new_status} in DB.")
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
    
    time.sleep(2)
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
            
            # A. Local Network Threat Monitoring
            local_threat = None
            
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
                    local_threat = {
                        "id": "LOCAL-WIFI",
                        "threat_name": "UNSECURE WI-FI DETECTED",
                        "severity": "medium",
                        "source_ip": "Local Gateway",
                        "ports": ssid or "Unknown SSID",
                        "protocol": auth_type,
                    }
            except Exception as e:
                pass
                
            # 2. Dynamic ARP spoof / MITM scan
            if not local_threat:
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
                            local_threat = {
                                "id": "LOCAL-MITM",
                                "threat_name": "ARP SPOOFING (MITM)",
                                "severity": "high",
                                "source_ip": ips[0],
                                "ports": mac,
                                "protocol": "ARP",
                            }
                            break
                except Exception as e:
                    pass
                    
            # 3. Packet rate flood check (DoS)
            if not local_threat and prev_io:
                try:
                    now = time.time()
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
                except Exception as e:
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

            # B. Query for new cases in ARGUS database
            active_db = db_path
            if not active_db.exists():
                launcher_dir = Path(__file__).parent.resolve()
                dev_db = launcher_dir.parent / "ARGUS" / "backend" / "database" / "argus.db"
                if dev_db.exists():
                    active_db = dev_db
                    
            new_threat = None
            if active_db.exists():
                try:
                    conn = sqlite3.connect(str(active_db))
                    conn.row_factory = sqlite3.Row
                    cur = conn.execute(
                        "SELECT id, threat_name, severity, source_ip, ports, protocol FROM case_files WHERE status = 'new' ORDER BY opened_at DESC LIMIT 1"
                    )
                    row = cur.fetchone()
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
            
            # Print status summary for backend logs
            print(f"[Launcher] Poller status payload: CPU={cpu:.1f}%, RAM={ram:.1f}%, Modules={status}")
            
            js_code = f'if(window.updateAllStatus) window.updateAllStatus({json.dumps(status)});'
            win.evaluate_js(js_code)
        except Exception as e:
            import traceback
            print(f"[Launcher] Error in status poller loop: {e}")
            traceback.print_exc()
        time.sleep(1.5)

if __name__ == '__main__':
    # Local file URL using pywebview's built-in local server capability
    url = os.path.join(dist_path, 'index.html')
    
    api = Api()
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
