"""AEGIS Master Suite Bundler Script.

Compiles ARGUS, CAST, and VISTA into standalone executables,
bundles them into launcher/bin/, and packages AEGIS_Launcher.exe
containing all 3 sub-applications by default.
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def run_cmd(cmd, cwd=None):
    print(f"\n=========================================")
    print(f"Executing: {cmd}")
    print(f"Directory: {cwd or 'root'}")
    print(f"=========================================\n")
    res = subprocess.run(cmd, shell=True, cwd=str(cwd) if cwd else None)
    if res.returncode != 0:
        print(f"Build step failed: {cmd}")
        sys.exit(res.returncode)

def main():
    root_dir = Path(__file__).parent.resolve()
    launcher_dir = root_dir / "launcher"
    launcher_bin_dir = launcher_dir / "bin"
    launcher_bin_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("      AEGIS SECURITY SUITE — MASTER BUILD         ")
    print("==================================================")

    # 1. Build ARGUS
    argus_dir = root_dir / "ARGUS"
    if (argus_dir / "build_exe.py").exists():
        print("\n[1/4] Building ARGUS Executable...")
        run_cmd(f"{sys.executable} build_exe.py", cwd=argus_dir)
        argus_exe = argus_dir / "dist" / "ARGUS.exe"
        if argus_exe.exists():
            shutil.copy2(str(argus_exe), str(launcher_bin_dir / "ARGUS.exe"))
            print(" -> ARGUS.exe copied to launcher/bin/")

    # 2. Build CAST
    cast_dir = root_dir / "CAST"
    if (cast_dir / "build_exe.py").exists():
        print("\n[2/4] Building CAST Executable...")
        run_cmd(f"{sys.executable} build_exe.py", cwd=cast_dir)
        cast_exe = cast_dir / "dist" / "CAST.exe"
        if cast_exe.exists():
            shutil.copy2(str(cast_exe), str(launcher_bin_dir / "CAST.exe"))
            print(" -> CAST.exe copied to launcher/bin/")

    # 3. Build VISTA
    vista_dir = root_dir / "VISTA"
    if (vista_dir / "build_exe.py").exists():
        print("\n[3/4] Building VISTA Executable...")
        run_cmd(f"{sys.executable} build_exe.py", cwd=vista_dir)
        vista_exe = vista_dir / "dist" / "VISTA.exe"
        if vista_exe.exists():
            shutil.copy2(str(vista_exe), str(launcher_bin_dir / "VISTA.exe"))
            print(" -> VISTA.exe copied to launcher/bin/")

    # 4. Build Launcher Frontend & PyInstaller Bundle
    print("\n[4/4] Building Launcher Frontend & Master Executable...")
    run_cmd("npx vite build --emptyOutDir false", cwd=launcher_dir)

    ssl_args = ""
    try:
        import _ssl
        ssl_dir = Path(_ssl.__file__).parent
        for pattern in ["*ssl*", "*crypto*"]:
            for f in ssl_dir.glob(pattern):
                ssl_args += f' --add-binary "{f}{os.pathsep}."'
    except Exception as e:
        print(f"Warning collecting OpenSSL DLLs: {e}")

    pyinstaller_cmd = (
        f'"{sys.executable}" -m PyInstaller '
        "--onefile "
        "--clean "
        "--noconfirm "
        "--windowed "
        "--name AEGIS_Launcher "
        f'--icon "{root_dir / "icon.ico"}" '
        f'--add-data "dist/index.html{os.pathsep}dist" '
        f'--add-data "dist/assets{os.pathsep}dist/assets" '
        f'--add-data "bin{os.pathsep}bin" '
        "--collect-all pywebview "
        "--collect-all pythonnet "
        "--collect-all clr_loader "
        "--hidden-import clr --hidden-import pythonnet --hidden-import clr_loader --hidden-import _ssl --hidden-import ssl "
        f"{ssl_args} "
        "run.py"
    )
    run_cmd(pyinstaller_cmd, cwd=launcher_dir)

    print("\n==================================================")
    print(" [SUCCESS] MASTER SUITE BUILD COMPLETE!")
    print(f" All 3 apps (ARGUS, CAST, VISTA) are pre-bundled inside:")
    print(f" Executable: {launcher_dir / 'dist' / 'AEGIS_Launcher.exe'}")
    print("==================================================")

if __name__ == "__main__":
    main()
