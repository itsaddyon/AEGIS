"""
GET  /api/packets            -> full packet list for the current session
GET  /api/packets/export     -> download as JSON or CSV (?format=json|csv)
POST /api/packets/clear      -> wipe the current session buffer
"""
from flask import Blueprint, jsonify, request, Response

from app.services.session_manager import session_manager
from app.services.export_service import to_json, to_csv

packets_bp = Blueprint("packets", __name__, url_prefix="/api/packets")


@packets_bp.get("")
def get_packets():
    return jsonify({
        "packets": session_manager.all(),
        "count": session_manager.count(),
    })


@packets_bp.get("/export")
def export_packets():
    fmt = request.args.get("format", "json").lower()
    packets = session_manager.all()

    if fmt == "csv":
        body = to_csv(packets)
        mimetype = "text/csv"
        filename = "vista_session.csv"
    else:
        body = to_json(packets)
        mimetype = "application/json"
        filename = "vista_session.json"

    return Response(
        body,
        mimetype=mimetype,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@packets_bp.post("/clear")
def clear_packets():
    session_manager.clear()
    return jsonify({"status": "cleared"})
