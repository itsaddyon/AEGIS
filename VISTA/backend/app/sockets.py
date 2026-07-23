"""
WebSocket layer. Keeps real-time concerns (start/stop/pause capture,
streaming new packets) separate from the REST routes, which only ever
serve snapshots/history.

Client -> Server events:
  start_capture   { interface?: string }
  stop_capture    {}
  pause_capture   {}
  resume_capture  {}

Server -> Client events:
  packet_captured   <packet dict>
  capture_status    { is_running, is_paused, interface }
  capture_error     { message }
"""
from flask_socketio import SocketIO

from app.capture.sniffer import capture_engine
from app.services.session_manager import session_manager

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")


def _broadcast_status():
    socketio.emit("capture_status", {
        "is_running": capture_engine.is_running,
        "is_paused": capture_engine.is_paused,
        "interface": capture_engine.interface,
        "is_mock": capture_engine.is_mock,
    })


import time
import threading

packet_batch_queue = []
batch_lock = threading.Lock()

def _on_packet(packet: dict):
    session_manager.add(packet)
    with batch_lock:
        packet_batch_queue.append(packet)

def _flush_packets_loop():
    while True:
        time.sleep(0.1)  # Flush 10 times per second
        with batch_lock:
            if not packet_batch_queue:
                continue
            batch = list(packet_batch_queue)
            packet_batch_queue.clear()
        try:
            socketio.emit("packets_captured", batch)
            # Emit single packet event for legacy clients
            for pkt in batch:
                socketio.emit("packet_captured", pkt)
        except Exception:
            pass

flusher = threading.Thread(target=_flush_packets_loop, daemon=True)
flusher.start()

capture_engine.on_packet = _on_packet


def register_socket_handlers():
    @socketio.on("start_capture")
    def handle_start(data=None):
        interface = (data or {}).get("interface")
        try:
            capture_engine.start(interface=interface)
            _broadcast_status()
        except Exception as exc:
            socketio.emit("capture_error", {"message": str(exc)})

    @socketio.on("stop_capture")
    def handle_stop():
        capture_engine.stop()
        _broadcast_status()

    @socketio.on("pause_capture")
    def handle_pause():
        capture_engine.pause()
        _broadcast_status()

    @socketio.on("resume_capture")
    def handle_resume():
        capture_engine.resume()
        _broadcast_status()

    @socketio.on("connect")
    def handle_connect():
        _broadcast_status()
