"""Detects repeated failed authentication attempts against the same
destination/port — the signature of a brute-force login attack.
"""
from __future__ import annotations

from collections import defaultdict

from backend.engine.base import DetectionModule, DetectionResult, NetworkEvent

FAILURE_THRESHOLD = 8


class BruteForceDetector(DetectionModule):
    id = "brute-force-detector"
    name = "Brute Force Detector"
    description = "Flags repeated failed login/auth attempts against one target."

    def analyze(self, events: list[NetworkEvent]) -> list[DetectionResult]:
        buckets: dict[tuple[str, str, int | None], int] = defaultdict(int)

        for e in events:
            if e.event_type != "auth_failure":
                continue
            buckets[(e.source_ip, e.destination_ip, e.port)] += 1

        results: list[DetectionResult] = []
        for (src, dst, port), count in buckets.items():
            if count < FAILURE_THRESHOLD:
                continue
            confidence = min(97, 55 + (count - FAILURE_THRESHOLD) * 3)
            results.append(self._build_result(src, dst, port, count, confidence))
        return results

    def _build_result(self, src: str, dst: str, port: int | None, count: int, confidence: int) -> DetectionResult:
        return DetectionResult(
            threat_name="Possible Brute Force Attempt",
            severity="high" if count >= 20 else "medium",
            confidence=confidence,
            evidence_summary=f"{count} failed auth attempts from {src} against {dst}:{port}",
            source_ip=src, destination_ip=dst, ports=[port] if port else [], protocol="TCP",
            plain_english=(
                "Someone tried logging in over and over with different passwords, hoping "
                "one would eventually work."
            ),
            analogy="Like trying every key on a giant keyring until one unlocks the door.",
            how_it_works=(
                "An automated tool submits many username/password combinations rapidly "
                "against a login service until it finds one that succeeds or gives up."
            ),
            why_attackers_do_it="To gain unauthorized access to an account or system without needing to know the real password in advance.",
            how_to_defend=(
                "Enable account lockout or rate-limiting after a few failed attempts, use "
                "multi-factor authentication, and monitor for spikes in auth failures."
            ),
            potential_impact="A successful brute force grants the attacker full access to the targeted account or service.",
            recommended_response=[
                "Lock or rate-limit the targeted account temporarily.",
                "Force a password reset if a login later succeeded from this source.",
                "Block the source IP if it continues after the lockout.",
            ],
        )
