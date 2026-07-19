"""
GET /api/alerts

Extension point for the future Intrusion Detection System (IDS) module.
Returns a well-formed placeholder today so the frontend can build its
"Threat Detection" screen against a stable contract before real
detection logic exists. Real logic will live in app/ids/ and call
into this route instead of returning static data.
"""
from flask import Blueprint, jsonify

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


@alerts_bp.get("")
def get_alerts():
    return jsonify({
        "enabled": False,
        "message": "Threat detection is not yet available. This module ships in a future version of VISTA.",
        "alerts": [],
    })
