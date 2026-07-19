"""
GET /api/network/status       -> is capture running, on which interface, counters
GET /api/network/interfaces   -> list of interfaces the user can choose from
"""
from flask import Blueprint, jsonify
from scapy.all import conf

from app.capture.sniffer import capture_engine
from app.capture.interfaces import list_interfaces
from app.services.session_manager import session_manager

network_bp = Blueprint("network", __name__, url_prefix="/api/network")


@network_bp.get("/status")
def get_status():
    return jsonify({
        "is_running": capture_engine.is_running,
        "is_paused": capture_engine.is_paused,
        "interface": capture_engine.interface,
        "packet_count": session_manager.count(),
        "protocol_breakdown": session_manager.protocol_breakdown(),
        "has_pcap": bool(conf.use_pcap),
    })


@network_bp.get("/interfaces")
def get_interfaces():
    try:
        ifaces = list_interfaces()
        if not ifaces:
            ifaces = [
                {"name": "Ethernet (Realtek PCIe GbE)", "address": "192.168.1.45"},
                {"name": "Wi-Fi (Intel(R) Wi-Fi 6 AX201)", "address": "192.168.1.46"},
                {"name": "Loopback Pseudo-Interface 1", "address": "127.0.0.1"},
            ]
        return jsonify({
            "interfaces": ifaces,
            "has_pcap": bool(conf.use_pcap)
        })
    except Exception as exc:
        # Provide friendly default interface choices for Demo Mode
        mock_ifaces = [
            {"name": "Ethernet (Realtek PCIe GbE)", "address": "192.168.1.45"},
            {"name": "Wi-Fi (Intel(R) Wi-Fi 6 AX201)", "address": "192.168.1.46"},
            {"name": "Loopback Pseudo-Interface 1", "address": "127.0.0.1"},
        ]
        return jsonify({
            "interfaces": mock_ifaces,
            "error": str(exc),
            "demo_fallback": True,
            "has_pcap": False
        }), 200
