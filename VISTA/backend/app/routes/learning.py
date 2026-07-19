"""
GET /api/learning

Extension point for the future Cybersecurity Learning Hub module.
Returns a well-formed placeholder today so the frontend can build its
"Learning Hub" screen against a stable contract. Real lesson content
and progress tracking will live in app/learning/ later.
"""
from flask import Blueprint, jsonify

learning_bp = Blueprint("learning", __name__, url_prefix="/api/learning")


@learning_bp.get("")
def get_learning():
    return jsonify({
        "enabled": True,
        "message": "VISTA Cybersecurity Learning Hub is active.",
        "modules": [],
    })


@learning_bp.post("/launch-cast")
def launch_cast():
    import sys
    from pathlib import Path
    import subprocess

    exe_name = "CAST.exe"
    dev_script_path = "CAST/backend/main.py"
    
    try:
        if getattr(sys, 'frozen', False):
            # Production Mode
            current_exe_dir = Path(sys.executable).parent
            # Try same directory
            target = current_exe_dir / exe_name
            if target.exists():
                subprocess.Popen([str(target)], close_fds=True)
                return jsonify({"success": True, "mode": "frozen_same_dir"})
            
            # Try parent directory
            target = current_exe_dir.parent / exe_name
            if target.exists():
                subprocess.Popen([str(target)], close_fds=True)
                return jsonify({"success": True, "mode": "frozen_parent_dir"})

            # Try adjacent dist folder
            target = current_exe_dir.parent.parent / "CAST" / "dist" / "CAST.exe"
            if target.exists():
                subprocess.Popen([str(target)], close_fds=True)
                return jsonify({"success": True, "mode": "frozen_adjacent_dist"})

            return jsonify({"success": False, "error": f"Executable {exe_name} not found."}), 404
        else:
            # Development Mode
            current_dir = Path(__file__).resolve().parent # app/routes/
            # Go up to the Btech Projects level (app/routes -> app -> backend -> VISTA -> Btech Projects)
            workspace_root = current_dir.parent.parent.parent.parent
            
            python_exe = sys.executable
            target_script = workspace_root / dev_script_path
            if target_script.exists():
                subprocess.Popen([python_exe, str(target_script)], close_fds=True)
                return jsonify({"success": True, "mode": "dev_script"})
            
            adjacent_exe = workspace_root / "CAST" / "dist" / "CAST.exe"
            if adjacent_exe.exists():
                subprocess.Popen([str(adjacent_exe)], close_fds=True)
                return jsonify({"success": True, "mode": "dev_adjacent_exe"})
                
            return jsonify({"success": False, "error": f"Dev script or EXE not found under {workspace_root}"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
