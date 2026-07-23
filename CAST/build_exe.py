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
    run_cmd("npm run build", cwd=frontend_dir)

    print("\n--- 2. Installing Bundler Dependencies ---")
    run_cmd("pip install pyinstaller pywebview")

    print("\n--- 3. Running PyInstaller Compiler ---")
    # We build from backend/main.py.
    # We add the built frontend/dist folder and database/schema.sql as data resources.
    # We do NOT use --uac-admin as CAST does not require elevated administration privileges.
    ssl_args = ""
    try:
        import _ssl
        from pathlib import Path
        ssl_dir = Path(_ssl.__file__).parent
        for pattern in ["*ssl*", "*crypto*"]:
            for f in ssl_dir.glob(pattern):
                ssl_args += f' --add-binary "{f};."'
    except Exception as e:
        print(f"Warning collecting OpenSSL DLLs: {e}")

    pyinstaller_cmd = (
        "python -m PyInstaller "
        "--onefile "
        "--noconsole "
        "--name CAST "
        f'--add-data "{os.path.join(frontend_dir, "dist")};frontend/dist" '
        f'--add-data "{os.path.join(root_dir, "database", "schema.sql")};database" '
        "--hidden-import vault_reader --hidden-import backend.vault_reader --hidden-import services.vault_reader "
        "--hidden-import _ssl --hidden-import ssl "
        f"{ssl_args} "
        f'"{os.path.join(backend_dir, "main.py")}"'
    )
    run_cmd(pyinstaller_cmd, cwd=root_dir)

    print("\n==================================================")
    print(" SUCCESS: Standalone EXE built successfully!")
    print(f" Compiled executable location: {os.path.join(root_dir, 'dist', 'CAST.exe')}")
    print("==================================================")

if __name__ == "__main__":
    main()
