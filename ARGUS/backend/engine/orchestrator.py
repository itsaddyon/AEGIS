"""Runs every active detection module over a batch of events and
turns each DetectionResult into a persisted Case File.
"""
from __future__ import annotations

from backend.engine.base import NetworkEvent
from backend.engine.registry import ACTIVE_MODULES
from backend.cases.models import CaseFile, ThreatLesson
from backend.cases.repository import create_case


import time

_threat_cooldowns: dict[tuple[str, str], float] = {}
COOLDOWN_SECONDS = 60.0

def run_detection_cycle(events: list[NetworkEvent]) -> list[CaseFile]:
    """Feed a batch of events through every active module and open a
    Case File for each finding. Called on a timer by main.py, or
    on-demand for a manual scan.
    """
    new_cases: list[CaseFile] = []
    now = time.time()

    for module in ACTIVE_MODULES:
        try:
            for result in module.analyze(events):
                key = (result.threat_name, result.source_ip or "unknown")
                last_seen = _threat_cooldowns.get(key, 0.0)
                if now - last_seen < COOLDOWN_SECONDS:
                    continue
                _threat_cooldowns[key] = now

                case = CaseFile(
                    id="",  # assigned by repository.create_case
                    threat_name=result.threat_name,
                    detection_module=module.id,
                    severity=result.severity,
                    confidence=result.confidence,
                    lesson=ThreatLesson(
                        plain_english=result.plain_english,
                        analogy=result.analogy,
                        how_it_works=result.how_it_works,
                        why_attackers_do_it=result.why_attackers_do_it,
                        how_to_defend=result.how_to_defend,
                    ),
                    potential_impact=result.potential_impact,
                    recommended_response=result.recommended_response,
                    source_ip=result.source_ip,
                    destination_ip=result.destination_ip,
                    ports=result.ports,
                    protocol=result.protocol,
                )
                new_cases.append(create_case(case))
        except Exception as e:
            print(f"Error in module {module.id}: {e}")

    return new_cases
