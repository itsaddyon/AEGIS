"""Repository layer for Case Files — translates between CaseFile
dataclasses and the SQLite case_files/evidence tables.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from backend.database.db import get_connection
from backend.cases.models import CaseFile, EvidenceItem, ThreatLesson
from backend import vault_reader

_case_counter_start = 1
_CLOSED_STATUSES = ("resolved", "dismissed")
_ALERTABLE_SEVERITIES = ("high", "critical")


def _row_to_case(row) -> CaseFile:
    return CaseFile(
        id=row["id"],
        threat_name=row["threat_name"],
        detection_module=row["detection_module"],
        severity=row["severity"],
        confidence=row["confidence"],
        status=row["status"],
        source_ip=row["source_ip"],
        destination_ip=row["destination_ip"],
        ports=json.loads(row["ports"] or "[]"),
        protocol=row["protocol"],
        lesson=ThreatLesson(
            plain_english=row["plain_english"] or "",
            analogy=row["analogy"] or "",
            how_it_works=row["how_it_works"] or "",
            why_attackers_do_it=row["why_attackers_do_it"] or "",
            how_to_defend=row["how_to_defend"] or "",
        ),
        potential_impact=row["potential_impact"] or "",
        recommended_response=json.loads(row["recommended_response"] or "[]"),
        mitre_attack_id=row["mitre_attack_id"],
        bookmarked=bool(row["bookmarked"]),
        notes=row["notes"] or "",
        opened_at=row["opened_at"],
        updated_at=row["updated_at"],
    )


def next_case_id(conn) -> str:
    """Generates the next sequential CASE #XXXXX id."""
    cur = conn.execute("SELECT COUNT(*) as n FROM case_files")
    n = cur.fetchone()["n"] + 1
    return f"CASE #{n:05d}"


def create_case(case: CaseFile) -> CaseFile:
    with get_connection() as conn:
        if not case.id:
            case.id = next_case_id(conn)
        conn.execute(
            """INSERT INTO case_files (
                id, threat_name, detection_module, severity, confidence, status,
                opened_at, updated_at, source_ip, destination_ip, ports, protocol,
                plain_english, analogy, how_it_works, why_attackers_do_it, how_to_defend,
                potential_impact, recommended_response, mitre_attack_id, bookmarked, notes
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                case.id, case.threat_name, case.detection_module, case.severity, case.confidence,
                case.status, case.opened_at, case.updated_at, case.source_ip, case.destination_ip,
                json.dumps(case.ports), case.protocol, case.lesson.plain_english, case.lesson.analogy,
                case.lesson.how_it_works, case.lesson.why_attackers_do_it, case.lesson.how_to_defend,
                case.potential_impact, json.dumps(case.recommended_response), case.mitre_attack_id,
                int(case.bookmarked), case.notes,
            ),
        )
        conn.commit()

    # Cross-app signal: a fresh HIGH/CRITICAL case pushes a live banner to
    # CAST and VISTA within 5s via the shared active_alert.json file.
    if (case.severity or "").lower() in _ALERTABLE_SEVERITIES:
        vault_reader.write_active_alert(
            case.threat_name, case.source_ip or "Unknown", case.severity,
            case.protocol or "IP", case_id=case.id,
        )
    return case


def list_cases(status: str | None = None) -> list[CaseFile]:
    with get_connection() as conn:
        if status:
            cur = conn.execute(
                "SELECT * FROM case_files WHERE status = ? ORDER BY opened_at DESC", (status,)
            )
        else:
            cur = conn.execute("SELECT * FROM case_files ORDER BY opened_at DESC")
        return [_row_to_case(r) for r in cur.fetchall()]


def get_case(case_id: str) -> CaseFile | None:
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM case_files WHERE id = ?", (case_id,))
        row = cur.fetchone()
        return _row_to_case(row) if row else None


def update_case_status(case_id: str, status: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE case_files SET status = ?, updated_at = ? WHERE id = ?",
            (status, datetime.now(timezone.utc).isoformat(), case_id),
        )
        conn.commit()

        if (status or "").lower() in _CLOSED_STATUSES:
            # Only clear (or hand off) the banner if it belongs to this
            # case — otherwise a still-open HIGH/CRITICAL case elsewhere
            # would lose its live alert.
            current_alert = vault_reader.read_active_alert()
            if current_alert.get("active") and current_alert.get("case_id") == case_id:
                cur = conn.execute(
                    """SELECT id, threat_name, source_ip, severity, protocol FROM case_files
                       WHERE severity IN ('high','critical')
                         AND status NOT IN ('resolved','dismissed')
                         AND id != ?
                       ORDER BY opened_at DESC LIMIT 1""",
                    (case_id,),
                )
                next_case = cur.fetchone()
                if next_case:
                    vault_reader.write_active_alert(
                        next_case["threat_name"], next_case["source_ip"] or "Unknown",
                        next_case["severity"], next_case["protocol"] or "IP",
                        case_id=next_case["id"],
                    )
                else:
                    vault_reader.clear_active_alert()


def toggle_bookmark(case_id: str, bookmarked: bool) -> None:
    with get_connection() as conn:
        conn.execute("UPDATE case_files SET bookmarked = ? WHERE id = ?", (int(bookmarked), case_id))
        conn.commit()
