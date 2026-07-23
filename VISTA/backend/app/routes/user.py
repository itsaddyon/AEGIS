"""
User & Identity routes for VISTA, syncing with AEGIS vault & active threats.
"""
import sys
import os
from flask import Blueprint, jsonify

try:
    from app.routes import vault_reader
except ImportError:
    try:
        import vault_reader
    except ImportError:
        vault_reader = None

user_bp = Blueprint("user", __name__, url_prefix="/api/user")

@user_bp.get("/identity")
def get_identity():
    username = "Agent"
    if vault_reader:
        try:
            username = vault_reader.read_username()
        except Exception:
            pass
    return jsonify({"username": username})

@user_bp.get("/active-alert")
def get_active_alert():
    if vault_reader:
        try:
            return jsonify(vault_reader.read_active_alert())
        except Exception:
            pass
    return jsonify({"active": False})
