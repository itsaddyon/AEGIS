"""Certificate generation for course/final-assessment completion."""
from __future__ import annotations

import datetime as dt
import uuid

from database.db import get_connection


def issue_certificate(display_name: str, final_score: int, dev_bypass: bool = False) -> dict:
    conn = get_connection()
    try:
        if not dev_bypass:
            total_missions = conn.execute("SELECT COUNT(*) FROM missions").fetchone()[0]
            completed_missions = conn.execute("SELECT COUNT(*) FROM mission_progress WHERE status = 'completed'").fetchone()[0]
            
            total_sims = conn.execute("SELECT COUNT(*) FROM simulations").fetchone()[0]
            attempted_sims = conn.execute("SELECT COUNT(DISTINCT simulation_id) FROM simulation_attempts").fetchone()[0]
            
            if completed_missions < total_missions or attempted_sims < total_sims:
                raise PermissionError("All missions and practice labs must be completed before a certificate can be issued.")

        cert_id = f"CAST-{uuid.uuid4().hex[:10].upper()}"
        conn.execute(
            "INSERT INTO certificates (id, display_name, final_score) VALUES (?, ?, ?)",
            (cert_id, display_name, final_score),
        )
        conn.commit()
    finally:
        conn.close()


    return {
        "id": cert_id,
        "displayName": display_name,
        "finalScore": final_score,
        "issuedAt": dt.date.today().isoformat(),
    }


def list_certificates() -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, display_name, final_score, issued_at FROM certificates "
            "ORDER BY issued_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
