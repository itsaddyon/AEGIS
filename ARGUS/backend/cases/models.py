"""Case File dataclasses — the shared vocabulary between the detection
engine, the API layer, and the frontend's CaseFile type in lib/types.ts.
Keep these two definitions in sync when either changes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal

Severity = Literal["low", "medium", "high", "critical"]
CaseStatus = Literal["new", "investigating", "contained", "resolved", "dismissed"]


@dataclass
class ThreatLesson:
    plain_english: str
    analogy: str
    how_it_works: str
    why_attackers_do_it: str
    how_to_defend: str


@dataclass
class EvidenceItem:
    id: str
    timestamp: str
    label: str
    detail: str
    source_ip: str | None = None
    destination_ip: str | None = None
    port: int | None = None
    protocol: str | None = None


@dataclass
class CaseFile:
    id: str
    threat_name: str
    detection_module: str
    severity: Severity
    confidence: int
    lesson: ThreatLesson
    potential_impact: str
    recommended_response: list[str]
    status: CaseStatus = "new"
    source_ip: str | None = None
    destination_ip: str | None = None
    ports: list[int] = field(default_factory=list)
    protocol: str | None = None
    evidence: list[EvidenceItem] = field(default_factory=list)
    mitre_attack_id: str | None = None
    bookmarked: bool = False
    notes: str = ""
    opened_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
