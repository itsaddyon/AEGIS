import subprocess
import sys
import os
import shutil

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd} in {cwd or 'current dir'}")
    res = subprocess.run(cmd, shell=True, cwd=cwd)
    if res.returncode != 0:
        print(f"Error executing command: {cmd}")
        sys.exit(res.returncode)

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    backend_dir = os.path.join(root_dir, "backend")

    print("--- 1. Building React Frontend ---")
    print("Installing npm dependencies...")
    run_cmd("npm install", cwd=frontend_dir)
    print("Running production build...")
    run_cmd("npm run build", cwd=frontend_dir)

    print("\n--- 2. Installing Bundler Dependencies ---")
    run_cmd("pip install pyinstaller pywebview")

    print("\n--- 3. Running PyInstaller Compiler ---")
    # We build from backend/main.py
    # We add the built frontend/dist folder as a data resource.
    # --uac-admin forces Windows to prompt for administrator privilege on launch (needed for NIDS live capture).
    # --onefile packages everything into a single executable.
    # --noconsole hides the raw command prompt windows.
    pyinstaller_cmd = (
        "python -m PyInstaller "
        "--onefile "
        "--noconsole "
        "--uac-admin "
        "--name ARGUS "
        f'--add-data "{os.path.join(frontend_dir, "dist")};frontend/dist" '
        f'--add-data "{os.path.join(backend_dir, "database")};database" '
        f'"{os.path.join(backend_dir, "main.py")}"'
    )
    run_cmd(pyinstaller_cmd, cwd=root_dir)

    print("\n==================================================")
    print(" SUCCESS: Standalone EXE built successfully!")
    print(f" Compiled executable location: {os.path.join(root_dir, 'dist', 'ARGUS.exe')}")
    print("==================================================")

if __name__ == "__main__":
    main()
