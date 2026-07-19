"""Central registry of active detection modules.

Adding a new detector: implement it under engine/modules/, import it
here, and add an instance to ACTIVE_MODULES. The Rules Engine (future
phase) will let users enable/disable modules per-rule at runtime —
this registry is the module catalog it reads from.
"""
from __future__ import annotations

from backend.engine.base import DetectionModule
from backend.engine.modules.port_scan import PortScanDetector
from backend.engine.modules.brute_force import BruteForceDetector
from backend.engine.modules.arp_spoofing import ArpSpoofingDetector

ACTIVE_MODULES: list[DetectionModule] = [
    PortScanDetector(),
    BruteForceDetector(),
    ArpSpoofingDetector(),
]


def get_module(module_id: str) -> DetectionModule | None:
    return next((m for m in ACTIVE_MODULES if m.id == module_id), None)
