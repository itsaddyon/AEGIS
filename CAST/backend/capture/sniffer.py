"""
Background packet capture engine.

Runs Scapy's sniff() in its own thread so it never blocks Flask-SocketIO's
event loop. Exposes start/stop/pause/resume — the rest of the app only
talks to this class, never to Scapy directly, which keeps the future
IDS module free to plug into on_packet() without touching capture logic.

NOTE: Live capture requires Npcap (Windows) or root/libpcap (Linux/Mac),
and the process must run with administrator / sudo privileges.
"""
import threading
from typing import Callable, Optional

from scapy.all import sniff, AsyncSniffer, conf

from app.capture.protocol_parser import parse_packet


class CaptureEngine:
    def __init__(self):
        self._sniffer: Optional[AsyncSniffer] = None
        self._lock = threading.Lock()
        self._paused = False
        self._interface: Optional[str] = None
        self.packet_count = 0
        self.on_packet: Optional[Callable[[dict], None]] = None
        self._is_mock = False
        self._mock_thread: Optional[threading.Thread] = None

    @property
    def is_running(self) -> bool:
        return (self._sniffer is not None and self._sniffer.running) or self._is_mock

    @property
    def is_paused(self) -> bool:
        return self._paused

    @property
    def interface(self) -> Optional[str]:
        return self._interface

    @property
    def is_mock(self) -> bool:
        return self._is_mock

    def _handle_raw_packet(self, raw_pkt):
        if self._paused:
            return
        try:
            packet = parse_packet(raw_pkt)
        except Exception:
            # Malformed / unsupported packet — skip rather than crash the thread
            return
        self.packet_count += 1
        if self.on_packet:
            self.on_packet(packet.to_dict())

    def start(self, interface: Optional[str] = None):
        with self._lock:
            if self.is_running:
                return
            self._interface = interface
            self._paused = False
            self._is_mock = False
            
            # Check if pcap is available (Npcap on Windows, libpcap on Linux/macOS)
            # If not, Scapy cannot sniff raw packets, so force mock mode.
            if not conf.use_pcap:
                print("No libpcap/Npcap provider available. Falling back to VISTA Demo Mode (Simulated Traffic).")
                self._is_mock = True
                self._sniffer = None
                self._mock_thread = threading.Thread(target=self._mock_loop, daemon=True)
                self._mock_thread.start()
                return

            try:
                # Try setting up live capture via Scapy
                self._sniffer = AsyncSniffer(
                    iface=interface,
                    prn=self._handle_raw_packet,
                    store=False,
                )
                self._sniffer.start()
                print(f"VISTA Capture Engine started on interface: {interface or 'default'}")
            except Exception as exc:
                print(f"Error starting real sniffer: {exc}. Falling back to VISTA Demo Mode (Simulated Traffic).")
                self._is_mock = True
                self._sniffer = None
                self._mock_thread = threading.Thread(target=self._mock_loop, daemon=True)
                self._mock_thread.start()

    def stop(self):
        with self._lock:
            if self._sniffer is not None:
                try:
                    self._sniffer.stop()
                except Exception:
                    pass
                self._sniffer = None
            self._is_mock = False
            self._mock_thread = None
            self._paused = False

    def pause(self):
        self._paused = True

    def resume(self):
        self._paused = False

    def reset_counter(self):
        self.packet_count = 0

    def _mock_loop(self):
        import random
        import time
        from scapy.all import IP, UDP, TCP, ICMP, ARP, DNS, DNSQR
        
        # Simulated devices
        gateway = "192.168.1.1"
        localhost = "192.168.1.45"
        dns_server = "1.1.1.1"
        web_server = "93.184.216.34" # example.com
        google_dns = "8.8.8.8"
        
        domains = ["google.com", "github.com", "vista-netscope.io", "wikipedia.org", "netflix.com"]
        
        def build_dns():
            sport = random.randint(50000, 65000)
            qname = random.choice(domains)
            return IP(src=localhost, dst=dns_server)/UDP(sport=sport, dport=53)/DNS(rd=1, qd=DNSQR(qname=qname))

        def build_tcp_handshake():
            # Returns a list representing SYN, SYN-ACK, ACK handshake sequence
            sport = random.randint(50000, 65000)
            dport = 443
            syn = IP(src=localhost, dst=web_server)/TCP(sport=sport, dport=dport, flags="S", seq=1000)
            syn_ack = IP(src=web_server, dst=localhost)/TCP(sport=dport, dport=sport, flags="SA", seq=5000, ack=1001)
            ack = IP(src=localhost, dst=web_server)/TCP(sport=sport, dport=dport, flags="A", seq=1001, ack=5001)
            return [syn, syn_ack, ack]

        def build_http():
            sport = random.randint(50000, 65000)
            req = IP(src=localhost, dst=web_server)/TCP(sport=sport, dport=80, flags="PA")/b"GET /api/v1/telemetry HTTP/1.1\r\nHost: vista-netscope.io\r\nUser-Agent: VISTA/1.0\r\n\r\n"
            resp = IP(src=web_server, dst=localhost)/TCP(sport=80, dport=sport, flags="PA")/b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 15\r\n\r\n{\"status\":\"ok\"}"
            return [req, resp]

        def build_arp():
            # Who has gateway?
            return ARP(op=1, hwsrc="00:1a:2b:3c:4d:5e", psrc=localhost, pdst=gateway)

        def build_icmp():
            return IP(src=localhost, dst=gateway)/ICMP(type=8, code=0)

        # Sequence state for handshake packets
        packet_queue = []

        while self.is_running and self._is_mock:
            if not self._paused:
                try:
                    if packet_queue:
                        pkt = packet_queue.pop(0)
                    else:
                        choice = random.choices(
                            ["dns", "handshake", "http", "arp", "icmp"],
                            weights=[0.3, 0.3, 0.2, 0.1, 0.1],
                            k=1
                        )[0]
                        
                        if choice == "dns":
                            pkt = build_dns()
                        elif choice == "handshake":
                            handshake = build_tcp_handshake()
                            pkt = handshake[0]
                            packet_queue.extend(handshake[1:])
                        elif choice == "http":
                            http_flow = build_http()
                            pkt = http_flow[0]
                            packet_queue.extend(http_flow[1:])
                        elif choice == "arp":
                            pkt = build_arp()
                        else:
                            pkt = build_icmp()
                            
                    self._handle_raw_packet(pkt)
                except Exception as e:
                    print(f"Error in mock loop packet builder: {e}")
            time.sleep(random.uniform(0.6, 1.4))


capture_engine = CaptureEngine()
