"""
Canonical packet representation used across the backend.
Mirrors frontend/src/types/packet.ts — keep the two in sync until
they are formally unified in shared/types.
"""
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class Packet:
    id: str
    timestamp: str            # ISO-8601
    src_ip: str
    dst_ip: str
    protocol: str              # TCP / UDP / ICMP / ARP / DNS / HTTP / HTTPS / OTHER
    src_port: Optional[int]
    dst_port: Optional[int]
    length: int
    status: str                 # "ok" | "warning" | "danger" (reserved for future IDS hooks)
    summary: str                # one-line human summary, e.g. "SYN -> established"
    src_dns: str = ""
    dst_dns: str = ""
    src_label: str = ""
    dst_label: str = ""
    headers: dict = field(default_factory=dict)
    payload_hex: str = ""
    payload_ascii: str = ""

    def to_dict(self) -> dict:
        return asdict(self)
