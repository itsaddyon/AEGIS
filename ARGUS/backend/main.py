"""ARGUS desktop entry point.

Boots the SQLite database, starts the PyWebView shell pointed at the
built frontend (frontend/dist in production, the Vite dev server in
development), and wires the Api class so React can call into Python.
"""
from __future__ import annotations

import sys
from pathlib import Path

import webview

from backend.database.db import init_db
from backend.api import Api

DEV_URL = "http://localhost:5177"
def resolve_frontend_target() -> str:
    if getattr(sys, 'frozen', False):
        return str(Path(sys._MEIPASS) / "frontend" / "dist" / "index.html")

    is_dev = "--dev" in sys.argv
    if is_dev:
        return DEV_URL
    return str(Path(__file__).parent.parent / "frontend" / "dist" / "index.html")


def main() -> None:
    init_db()

    api = Api()
    window = webview.create_window(
        title="ARGUS — AEGIS Security Suite",
        url=resolve_frontend_target(),
        js_api=api,
        width=1440,
        height=900,
        min_size=(1100, 700),
        frameless=False,
        easy_drag=False,
    )
    api.set_window(window)

    # Boot the Real-Time NIDS engine with batched UI event flushing
    import json
    import time
    import threading
    from dataclasses import asdict
    from backend.network.sniffer import LiveSniffer
    from backend.engine.orchestrator import run_detection_cycle
    
    packet_buffer = []
    case_buffer = []
    buffer_lock = threading.Lock()
    is_running = True

    def on_packet(event):
        try:
            p_data = {
                "source_ip": event.source_ip,
                "destination_ip": event.destination_ip,
                "protocol": event.protocol,
                "source_port": event.source_port if hasattr(event, 'source_port') else 0,
                "destination_port": event.destination_port if hasattr(event, 'destination_port') else 0,
                "bytes": len(event.payload_preview) // 2 if hasattr(event, 'payload_preview') and event.payload_preview else 0,
            }
            new_cases = run_detection_cycle([event])
            
            with buffer_lock:
                packet_buffer.append(p_data)
                for case in new_cases:
                    case_buffer.append(asdict(case))
        except Exception:
            pass

    def telemetry_loop():
        """Background loop that streams system network telemetry (open connections,
        listening ports) via psutil into the frontend's Live Monitoring view."""
        import psutil
        nonlocal is_running
        while is_running:
            try:
                telemetry_events = []
                conns = psutil.net_connections(kind='inet')
                
                for conn in conns[:50]:  # Cap at 50 per cycle
                    status = conn.status.lower() if conn.status else 'none'
                    src_ip = conn.laddr.ip if conn.laddr else '0.0.0.0'
                    src_port = conn.laddr.port if conn.laddr else 0
                    dst_ip = conn.raddr.ip if conn.raddr else ''
                    dst_port = conn.raddr.port if conn.raddr else 0
                    pid = conn.pid or 0
                    
                    # Try to get process name
                    proc_name = ''
                    if pid:
                        try:
                            proc_name = psutil.Process(pid).name()
                        except Exception:
                            proc_name = f'PID {pid}'
                    
                    # Determine event category
                    if status == 'listen':
                        category = 'ports'
                    elif dst_ip:
                        category = 'connections'
                    else:
                        category = 'traffic'
                    
                    # Flag suspicious ports
                    suspicious_ports = {4444, 5555, 6666, 1337, 31337, 12345}
                    evt_status = 'normal'
                    if src_port in suspicious_ports or dst_port in suspicious_ports:
                        evt_status = 'suspicious'
                    elif status in ('syn_sent', 'close_wait', 'time_wait'):
                        evt_status = 'watch'
                    
                    telemetry_events.append({
                        "id": f"tel-{pid}-{src_port}-{dst_port}",
                        "category": category,
                        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S'),
                        "sourceIp": src_ip,
                        "destinationIp": dst_ip,
                        "port": src_port if category == 'ports' else dst_port,
                        "protocol": 'TCP' if conn.type == 1 else 'UDP',
                        "processName": proc_name,
                        "pid": pid,
                        "bytes": 0,
                        "status": evt_status,
                        "detail": f"{proc_name} ({status}) {src_ip}:{src_port} → {dst_ip}:{dst_port}" if dst_ip else f"{proc_name} listening on {src_ip}:{src_port}",
                    })
                
                if telemetry_events:
                    tel_json = json.dumps(telemetry_events)
                    try:
                        window.evaluate_js(f"if (window.onTelemetry) window.onTelemetry({tel_json})")
                    except Exception:
                        pass
            except Exception:
                pass
            
            time.sleep(2)  # Refresh telemetry every 2 seconds

    def flush_loop():
        nonlocal is_running
        while is_running:
            time.sleep(0.1)  # Flush up to 10 FPS
            with buffer_lock:
                if not packet_buffer and not case_buffer:
                    continue
                to_send_packets = list(packet_buffer)
                to_send_cases = list(case_buffer)
                packet_buffer.clear()
                case_buffer.clear()
            
            try:
                if to_send_packets:
                    pkts_json = json.dumps(to_send_packets)
                    window.evaluate_js(f"if (window.onLivePacketBatch) {{ window.onLivePacketBatch({pkts_json}); }} else if (window.onLivePacket) {{ {pkts_json}.forEach(p => window.onLivePacket(p)); }}")
                if to_send_cases:
                    cases_json = json.dumps(to_send_cases)
                    window.evaluate_js(f"if (window.onNewAlertBatch) {{ window.onNewAlertBatch({cases_json}); }} else if (window.onNewAlert) {{ {cases_json}.forEach(c => window.onNewAlert(c)); }}")
            except Exception:
                pass

    flush_thread = threading.Thread(target=flush_loop, daemon=True)
    flush_thread.start()

    telemetry_thread = threading.Thread(target=telemetry_loop, daemon=True)
    telemetry_thread.start()

    sniffer = LiveSniffer(on_packet)
    sniffer.start()

    webview.start(debug="--dev" in sys.argv)
    
    is_running = False
    sniffer.stop()


if __name__ == "__main__":
    main()
