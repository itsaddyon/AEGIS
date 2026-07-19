"""Detects a single source IP probing many distinct ports on the same
destination within a short time window — classic reconnaissance
(nmap-style) behavior.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from backend.engine.base import DetectionModule, DetectionResult, NetworkEvent

PORT_THRESHOLD = 5          # distinct ports probed
WINDOW_SECONDS = 10          # within this many seconds


class PortScanDetector(DetectionModule):
    id = "port-scan-detector"
    name = "Port Scan Detector"
    description = "Flags a source IP probing many ports on a target in a short window."

    def analyze(self, events: list[NetworkEvent]) -> list[DetectionResult]:
        results: list[DetectionResult] = []
        buckets: dict[tuple[str, str], list[NetworkEvent]] = defaultdict(list)

        for e in events:
            if e.event_type != "connection_attempt" or e.port is None:
                continue
            buckets[(e.source_ip, e.destination_ip)].append(e)

        for (src, dst), evs in buckets.items():
            evs.sort(key=lambda e: e.timestamp)
            distinct_ports = {e.port for e in evs}
            if len(distinct_ports) < PORT_THRESHOLD:
                continue

            first_t = datetime.fromisoformat(evs[0].timestamp)
            last_t = datetime.fromisoformat(evs[-1].timestamp)
            if (last_t - first_t).total_seconds() > WINDOW_SECONDS:
                continue

            confidence = min(99, 60 + (len(distinct_ports) - PORT_THRESHOLD) * 5)
            results.append(self._build_result(src, dst, sorted(distinct_ports), confidence))

        return results

    def _build_result(self, src: str, dst: str, ports: list[int], confidence: int) -> DetectionResult:
        severity = "high" if len(ports) >= 15 else "medium"
        return DetectionResult(
            threat_name="Possible Port Scan",
            severity=severity,
            confidence=confidence,
            evidence_summary=f"{len(ports)} ports probed on {dst} from {src} within {WINDOW_SECONDS}s",
            source_ip=src,
            destination_ip=dst,
            ports=ports,
            protocol="TCP",
            plain_english=(
                "A device on your network tried knocking on many doors (ports) on another "
                "device very quickly. This is how attackers check what services are running "
                "before choosing where to attack."
            ),
            analogy=(
                "Imagine someone walking down your street trying every door handle to see "
                "which ones are unlocked."
            ),
            how_it_works=(
                "A scanning tool sends connection requests across a range of ports in rapid "
                "succession and records which ones respond, revealing what's running on the target."
            ),
            why_attackers_do_it=(
                "To map out exposed services (web servers, remote desktop, databases) before "
                "planning a targeted attack against whichever one looks vulnerable."
            ),
            how_to_defend=(
                "Close unused ports, enable a firewall, and alert on repeated rapid connection "
                "attempts from a single source across many ports."
            ),
            potential_impact=(
                "If this reconnaissance succeeds, the attacker gains a map of exploitable "
                "services, enabling a more targeted follow-up attack."
            ),
            recommended_response=[
                "Verify whether the source device is authorized to be on this network.",
                "Temporarily block the source IP if it isn't recognized.",
                "Review firewall rules for the ports that were scanned.",
            ],
        )
