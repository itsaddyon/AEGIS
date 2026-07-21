import os
import sys
import subprocess
from pathlib import Path

def main():
    cwd = Path(__file__).parent.resolve()
    print(f"Building Vite frontend in {cwd}...")
    subprocess.check_call("npm run build", shell=True, cwd=str(cwd))
    
    print("Running PyInstaller...")
    subprocess.check_call([
        sys.executable, "-m", "PyInstaller",
        "--clean",
        "--noconfirm",
        "--windowed",
        "--name", "AEGIS_Launcher",
        "--add-data", f"dist{os.pathsep}dist",
        "run.py"
    ], cwd=str(cwd))
    
    print("Build complete!")

if __name__ == "__main__":
    main()
