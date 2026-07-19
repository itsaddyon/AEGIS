"""Detects ARP spoofing: the same IP address suddenly being claimed by
more than one MAC address, which is how attackers impersonate a
router or another host on the local network.
"""
from __future__ import annotations

from collections import defaultdict

from backend.engine.base import DetectionModule, DetectionResult, NetworkEvent


class ArpSpoofingDetector(DetectionModule):
    id = "arp-spoofing-detector"
    name = "ARP Spoofing Detector"
    description = "Flags an IP address being claimed by multiple MAC addresses."

    def analyze(self, events: list[NetworkEvent]) -> list[DetectionResult]:
        claims: dict[str, set[str]] = defaultdict(set)
        latest_event: dict[str, NetworkEvent] = {}

        for e in events:
            if e.event_type != "arp_reply":
                continue
            mac = e.metadata.get("mac_address")
            if not mac:
                continue
            claims[e.source_ip].add(mac)
            latest_event[e.source_ip] = e

        results: list[DetectionResult] = []
        for ip, macs in claims.items():
            if len(macs) < 2:
                continue
            results.append(self._build_result(ip, sorted(macs), latest_event[ip]))
        return results

    def _build_result(self, ip: str, macs: list[str], event) -> DetectionResult:
        return DetectionResult(
            threat_name="Possible ARP Spoofing",
            severity="critical",
            confidence=93,
            evidence_summary=f"{ip} claimed by {len(macs)} different MAC addresses: {', '.join(macs)}",
            source_ip=ip, destination_ip=None, ports=[], protocol="ARP",
            plain_english=(
                "Someone on your local network is pretending to be another device — often "
                "your router — so that traffic meant for it gets sent to the attacker instead."
            ),
            analogy=(
                "Imagine someone secretly swapping the nameplate on your router with their "
                "own, so every device on the network unknowingly talks to them first."
            ),
            how_it_works=(
                "ARP has no built-in authentication, so an attacker can broadcast fake "
                "replies claiming their MAC address owns a legitimate IP (often the gateway). "
                "Devices update their ARP tables and start routing traffic through the attacker."
            ),
            why_attackers_do_it=(
                "To intercept, inspect, or modify traffic between devices and the real "
                "gateway — enabling eavesdropping, credential theft, or session hijacking."
            ),
            how_to_defend=(
                "Use static ARP entries for critical devices, enable dynamic ARP inspection "
                "on managed switches, and use encrypted protocols (HTTPS, VPN) end to end."
            ),
            potential_impact=(
                "All traffic from affected devices could be silently intercepted, exposing "
                "logins, session tokens, and unencrypted data."
            ),
            recommended_response=[
                "Identify which MAC address is the legitimate gateway and isolate the other.",
                "Restart affected devices' ARP tables once the rogue device is removed.",
                "Consider enabling port security or DAI on network switches.",
            ],
        )
