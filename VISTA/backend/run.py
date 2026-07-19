import sys
import threading
import socket
import webbrowser
from app import create_app
from app.sockets import socketio
from app.config import config

def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

app = create_app()

def start_server(port):
    try:
        socketio.run(app, host='0.0.0.0', port=port, debug=False, use_reloader=False, allow_unsafe_werkzeug=True)
    except Exception as exc:
        import traceback
        with open("vista_error.log", "w") as f:
            f.write(f"VISTA Server crashed during startup:\n{str(exc)}\n")
            traceback.print_exc(file=f)

if __name__ == "__main__":
    if config.DEBUG and not getattr(sys, 'frozen', False):
        socketio.run(app, host=config.HOST, port=config.PORT, debug=config.DEBUG)
    else:
        port = find_free_port()
        url = f"http://127.0.0.1:{port}"
        
        server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
        server_thread.start()
        
        import time
        import urllib.request
        print("Waiting for local server to initialize...")
        for _ in range(50):
            try:
                with urllib.request.urlopen(f"{url}/api/health", timeout=0.1) as r:
                    if r.status == 200:
                        print("Local server is ready!")
                        break
            except Exception:
                time.sleep(0.1)
        
        print(f"\n==================================================")
        print(f" VISTA Network Security & Traffic Analyzer")
        print(f"==================================================")
        print(f" -> Local Dashboard URL: {url}")
        
        try:
            hostname = socket.gethostname()
            local_ips = socket.gethostbyname_ex(hostname)[2]
            print(f" -> Remote Mobile Access Links:")
            for ip in local_ips:
                if not ip.startswith("127."):
                    print(f"    📱 http://{ip}:{port}")
        except Exception:
            pass
        print(f"==================================================\n")
        
        try:
            import webview
            print("Launching native VISTA app shell...")
            
            def init_window(w):
                import time
                time.sleep(0.4)
                try:
                    import ctypes
                    hwnd = None
                    if hasattr(w, 'native') and w.native:
                        if hasattr(w.native, 'Handle'):
                            hwnd = w.native.Handle.ToInt64()
                        elif hasattr(w.native, 'hwnd'):
                            hwnd = w.native.hwnd
                    
                    if hwnd:
                        ctypes.windll.user32.ShowWindow(hwnd, 9)
                        ctypes.windll.user32.SetForegroundWindow(hwnd)
                except Exception as focus_err:
                    print(f"Failed to force foreground focus: {focus_err}")

            class Api:
                def _launch_app(self, app_folder: str, app_exe: str):
                    import os
                    import subprocess
                    import pathlib
                    try:
                        # VISTA/backend/run.py -> up 2 levels -> AEGIS root
                        current_dir = pathlib.Path(__file__).resolve().parent
                        workspace_root = current_dir.parent.parent
                        
                        if getattr(sys, 'frozen', False):
                            current_exe_dir = pathlib.Path(sys.executable).parent
                            target = current_exe_dir.parent.parent / app_folder / "dist" / app_exe
                            if not target.exists():
                                target = current_exe_dir.parent / app_exe
                            if not target.exists():
                                target = current_exe_dir / app_exe
                            
                            if target.exists():
                                os.startfile(str(target))
                                return
                        else:
                            # Dev mode fallback
                            target_script = workspace_root / app_folder / "backend" / "main.py"
                            if not target_script.exists():
                                target_script = workspace_root / app_folder / "backend" / "run.py"
                            
                            if target_script.exists():
                                subprocess.Popen([sys.executable, str(target_script)], cwd=str(workspace_root / app_folder), close_fds=True)
                                return
                    except Exception as e:
                        print(f"Launch failed: {e}")

                def launch_argus(self):
                    self._launch_app("ARGUS", "ARGUS.exe")

                def launch_cast(self):
                    self._launch_app("CAST", "CAST.exe")

            api = Api()

            window = webview.create_window(
                title='VISTA Network Security & Traffic Analyzer',
                url=url,
                width=1280,
                height=800,
                resizable=True,
                min_size=(800, 600),
                maximized=True,
                focus=True,
                js_api=api
            )
            webview.start(init_window, window)
            print("Native VISTA window closed. Exiting.")
        except Exception as exc:
            print(f"Could not load pywebview: {exc}. Falling back to default system web browser...")
            webbrowser.open(url)
            
            import time
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("Stopping VISTA server.")
