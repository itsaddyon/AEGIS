import os
import sys
import subprocess
from pathlib import Path

def main():
    cwd = Path(__file__).parent.resolve()
    print(f"Building Vite frontend in {cwd}...")
    subprocess.check_call("npx vite build --emptyOutDir false", shell=True, cwd=str(cwd))
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--clean",
        "--onefile",
        "--noconfirm",
        "--windowed",
        "--name", "AEGIS_Launcher",
        "--add-data", f"dist/index.html{os.pathsep}dist",
        "--add-data", f"dist/assets{os.pathsep}dist/assets",
    ]
    if (cwd / "bin").exists():
        cmd.extend(["--add-data", f"bin{os.pathsep}bin"])
    # Collect OpenSSL DLLs (libssl-3.dll, libcrypto-3.dll, _ssl.pyd) for PyInstaller on Windows
    try:
        import _ssl
        ssl_dir = Path(_ssl.__file__).parent
        for pattern in ["*ssl*", "*crypto*"]:
            for f in ssl_dir.glob(pattern):
                cmd.extend(["--add-binary", f"{f}{os.pathsep}."])
    except Exception as e:
        print(f"Warning collecting OpenSSL DLLs: {e}")

    cmd.extend([
        "--collect-all", "pywebview",
        "--collect-all", "pythonnet",
        "--collect-all", "clr_loader",
        "--hidden-import", "clr",
        "--hidden-import", "pythonnet",
        "--hidden-import", "clr_loader",
        "--hidden-import", "_ssl",
        "--hidden-import", "ssl"
    ])
    cmd.append("run.py")

    print("Running PyInstaller...")
    subprocess.check_call(cmd, cwd=str(cwd))
    
    print("Build complete!")

if __name__ == "__main__":
    main()
