import threading
import socket
import logging
from scapy.all import sniff, IP, TCP, UDP, conf
from backend.engine.base import NetworkEvent

log = logging.getLogger(__name__)

class LiveSniffer:
    def __init__(self, callback):
        self.callback = callback
        self.is_running = False
        self.thread = None

    def _packet_handler(self, packet):
        if not self.is_running:
            return

        try:
            if IP in packet:
                src_ip = packet[IP].src
                dst_ip = packet[IP].dst
                protocol = "OTHER"
                src_port = 0
                dst_port = 0

                if TCP in packet:
                    protocol = "TCP"
                    src_port = packet[TCP].sport
                    dst_port = packet[TCP].dport
                elif UDP in packet:
                    protocol = "UDP"
                    src_port = packet[UDP].sport
                    dst_port = packet[UDP].dport

                event = NetworkEvent(
                    source_ip=src_ip,
                    destination_ip=dst_ip,
                    protocol=protocol,
                    source_port=src_port,
                    destination_port=dst_port,
                    payload_preview=bytes(packet[IP].payload)[:100].hex()
                )
                self.callback(event)
        except Exception as e:
            log.debug(f"Error parsing packet: {e}")

    def start(self):
        if self.is_running:
            return
        
        # Optimize scapy config for speed
        conf.sniff_promisc = False
        
        self.is_running = True
        self.thread = threading.Thread(target=self._sniff_loop, daemon=True)
        self.thread.start()

    def _sniff_loop(self):
        try:
            # Sniff 50 packets at a time to remain responsive
            sniff(prn=self._packet_handler, store=False, stop_filter=lambda p: not self.is_running)
        except Exception as e:
            log.error(f"Sniffer crashed: {e}")

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=2.0)
