"""Shared AEGIS vault reader — local, file-based, zero-IPC identity and
cross-app signalling. Reads/writes the same %LOCALAPPDATA%/AEGIS/*.json
files as the launcher and every other suite app (CAST, VISTA). Keep this
file identical across ARGUS/CAST/VISTA/launcher; it has no app-specific
imports so it can be copied verbatim.
"""
import os
import json


def get_aegis_dir():
    appdata = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
    aegis_dir = os.path.join(appdata, 'AEGIS')
    os.makedirs(aegis_dir, exist_ok=True)
    return aegis_dir


def get_vault_path():
    return os.path.join(get_aegis_dir(), 'vault.json')


def get_active_alert_path():
    return os.path.join(get_aegis_dir(), 'active_alert.json')


def get_cast_profile_path():
    return os.path.join(get_aegis_dir(), 'cast_profile.json')


def read_vault():
    vault_path = get_vault_path()
    if os.path.exists(vault_path):
        try:
            with open(vault_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def read_username():
    vault = read_vault()
    user = vault.get("user")
    if user and isinstance(user, dict):
        return user.get("username", "Agent")
    return "Agent"


def write_active_alert(threat_name, source_ip, severity, protocol="TCP", case_id=None):
    alert_path = get_active_alert_path()
    try:
        with open(alert_path, 'w', encoding='utf-8') as f:
            json.dump({
                "active": True,
                "threat_name": threat_name,
                "source_ip": source_ip,
                "severity": severity,
                "protocol": protocol,
                "case_id": case_id,
            }, f, indent=2)
    except Exception:
        pass


def clear_active_alert():
    alert_path = get_active_alert_path()
    try:
        if os.path.exists(alert_path):
            os.remove(alert_path)
    except Exception:
        pass


def read_active_alert():
    alert_path = get_active_alert_path()
    if os.path.exists(alert_path):
        try:
            with open(alert_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"active": False}


def write_cast_profile(xp, level, rank, completion_percent=0):
    profile_path = get_cast_profile_path()
    try:
        with open(profile_path, 'w', encoding='utf-8') as f:
            json.dump({
                "xp": xp,
                "level": level,
                "rank": rank,
                "completion_percent": completion_percent
            }, f, indent=2)
    except Exception:
        pass


def read_cast_profile():
    profile_path = get_cast_profile_path()
    if os.path.exists(profile_path):
        try:
            with open(profile_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"xp": 0, "level": 1, "rank": "Novice", "completion_percent": 0}
