"""
Turns a raw Scapy packet into our canonical Packet model, including a
plain-English summary. This is the single place protocol-detection
logic lives, so adding a new protocol only requires editing here.
"""
import uuid
from datetime import datetime, timezone

from scapy.all import IP, IPv6, TCP, UDP, ICMP, ARP, DNS, Raw
from app.models.packet import Packet
from app.utils.dns_resolver import dns_resolver

HTTP_PORTS = {80, 8080, 8000}
HTTPS_PORTS = {443, 8443}
DNS_PORTS = {53}


def _detect_protocol(pkt) -> str:
    if pkt.haslayer(ARP):
        return "ARP"
    if pkt.haslayer(DNS):
        return "DNS"
    if pkt.haslayer(TCP):
        sport, dport = pkt[TCP].sport, pkt[TCP].dport
        if sport in HTTPS_PORTS or dport in HTTPS_PORTS:
            return "HTTPS"
        if sport in HTTP_PORTS or dport in HTTP_PORTS:
            return "HTTP"
        return "TCP"
    if pkt.haslayer(UDP):
        if pkt[UDP].sport in DNS_PORTS or pkt[UDP].dport in DNS_PORTS:
            return "DNS"
        return "UDP"
    if pkt.haslayer(ICMP):
        return "ICMP"
    return "OTHER"


def _summarize(pkt, protocol: str) -> str:
    if protocol == "TCP" and pkt.haslayer(TCP):
        flags = pkt[TCP].sprintf("%TCP.flags%")
        return f"TCP segment, flags={flags}"
    if protocol in ("HTTP", "HTTPS"):
        return f"{protocol} traffic on port {pkt[TCP].dport if pkt.haslayer(TCP) else '?'}"
    if protocol == "DNS" and pkt.haslayer(DNS):
        qname = None
        try:
            if pkt[DNS].qd is not None:
                qname = pkt[DNS].qd.qname.decode(errors="ignore")
        except Exception:
            qname = None
        return f"DNS lookup for {qname}" if qname else "DNS message"
    if protocol == "ARP" and pkt.haslayer(ARP):
        return f"ARP {'request' if pkt[ARP].op == 1 else 'reply'}: who has {pkt[ARP].pdst}?"
    if protocol == "ICMP":
        return "ICMP echo / network reachability check"
    if protocol == "UDP":
        return "UDP datagram"
    return "Unclassified traffic"


def parse_packet(raw_pkt) -> Packet:
    protocol = _detect_protocol(raw_pkt)

    src_ip = dst_ip = "-"
    if raw_pkt.haslayer(IP):
        src_ip, dst_ip = raw_pkt[IP].src, raw_pkt[IP].dst
    elif raw_pkt.haslayer(IPv6):
        src_ip, dst_ip = raw_pkt[IPv6].src, raw_pkt[IPv6].dst
    elif raw_pkt.haslayer(ARP):
        src_ip, dst_ip = raw_pkt[ARP].psrc, raw_pkt[ARP].pdst

    src_port = dst_port = None
    if raw_pkt.haslayer(TCP):
        src_port, dst_port = int(raw_pkt[TCP].sport), int(raw_pkt[TCP].dport)
    elif raw_pkt.haslayer(UDP):
        src_port, dst_port = int(raw_pkt[UDP].sport), int(raw_pkt[UDP].dport)

    raw_bytes = bytes(raw_pkt)
    payload_hex = raw_bytes.hex(" ")
    payload_ascii = "".join(chr(b) if 32 <= b <= 126 else "." for b in raw_bytes)

    headers = {}
    for layer in ("IP", "IPv6", "TCP", "UDP", "ICMP", "ARP"):
        if raw_pkt.haslayer(layer):
            headers[layer] = raw_pkt[layer].fields.copy() if hasattr(raw_pkt[layer], "fields") else {}
            headers[layer] = {k: str(v) for k, v in headers[layer].items()}

    src_dns, src_label = dns_resolver.resolve(src_ip)
    dst_dns, dst_label = dns_resolver.resolve(dst_ip)

    return Packet(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc).isoformat(),
        src_ip=src_ip,
        dst_ip=dst_ip,
        protocol=protocol,
        src_port=src_port,
        dst_port=dst_port,
        length=len(raw_pkt),
        status="ok",
        summary=_summarize(raw_pkt, protocol),
        src_dns=src_dns,
        dst_dns=dst_dns,
        src_label=src_label,
        dst_label=dst_label,
        headers=headers,
        payload_hex=payload_hex,
        payload_ascii=payload_ascii,
    )
