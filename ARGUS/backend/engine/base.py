"""Base class for all ARGUS detection modules.

Every detector (port scan, ARP spoofing, brute force, beaconing, ...)
subclasses DetectionModule and implements analyze(). The engine calls
analyze() on a stream of NetworkEvent objects and collects any
DetectionResult it returns into a new Case File.

This keeps modules independent and pluggable: adding a new detector
means dropping a new file in backend/engine/modules/ and registering
it in backend/engine/registry.py — nothing else changes.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class NetworkEvent:
    """A single observed network event fed into the engine.
    Field set is intentionally generic so it can come from a live
    capture, a replayed pcap, or (for now) simulated test data.
    """
    timestamp: str
    source_ip: str
    destination_ip: str
    port: int | None
    protocol: str | None
    event_type: str          # e.g. "connection_attempt", "dns_query", "arp_reply"
    metadata: dict[str, Any]


@dataclass
class DetectionResult:
    """What a module returns when it believes it has found something.
    The engine turns this into a Case File via cases/repository.py.
    """
    threat_name: str
    severity: str             # "low" | "medium" | "high" | "critical"
    confidence: int            # 0-100
    evidence_summary: str
    source_ip: str | None
    destination_ip: str | None
    ports: list[int]
    protocol: str | None
    plain_english: str
    analogy: str
    how_it_works: str
    why_attackers_do_it: str
    how_to_defend: str
    potential_impact: str
    recommended_response: list[str]


class DetectionModule(ABC):
    """Contract every detection module must implement."""

    id: str = "base"
    name: str = "Base Detection Module"
    description: str = ""

    @abstractmethod
    def analyze(self, events: list[NetworkEvent]) -> list[DetectionResult]:
        """Inspect a batch of events and return zero or more findings."""
        raise NotImplementedError
