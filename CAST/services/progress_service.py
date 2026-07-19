"""Mission and simulation progress tracking."""
from __future__ import annotations

from database.db import get_connection
from services.gamification_service import award_xp


def get_all_mission_progress() -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT m.id, m.title, m.order_index, m.xp_reward,
                      COALESCE(p.status, 'locked') AS status,
                      p.quiz_score, p.completed_at
               FROM missions m
               LEFT JOIN mission_progress p ON p.mission_id = m.id
               ORDER BY m.order_index"""
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def complete_mission(mission_id: str, quiz_score: int) -> dict:
    conn = get_connection()
    try:
        xp_row = conn.execute(
            "SELECT xp_reward, title FROM missions WHERE id = ?", (mission_id,)
        ).fetchone()
        if not xp_row:
            raise ValueError(f"Unknown mission: {mission_id}")

        conn.execute(
            """INSERT INTO mission_progress (mission_id, status, quiz_score, completed_at)
               VALUES (?, 'completed', ?, datetime('now'))
               ON CONFLICT(mission_id) DO UPDATE SET
                   status='completed', quiz_score=excluded.quiz_score,
                   completed_at=excluded.completed_at""",
            (mission_id, quiz_score),
        )
        conn.commit()
    finally:
        conn.close()

    return award_xp(xp_row["xp_reward"], f"Completed mission: {xp_row['title']}")


def record_simulation_attempt(simulation_id: str, correct: int, total: int) -> dict:
    conn = get_connection()
    try:
        sim = conn.execute(
            "SELECT title, xp_reward FROM simulations WHERE id = ?", (simulation_id,)
        ).fetchone()
        if not sim:
            raise ValueError(f"Unknown simulation: {simulation_id}")

        ratio = correct / total if total else 0
        xp_earned = round(sim["xp_reward"] * ratio)

        conn.execute(
            """INSERT INTO simulation_attempts
               (simulation_id, correct_count, total_count, xp_earned)
               VALUES (?, ?, ?, ?)""",
            (simulation_id, correct, total, xp_earned),
        )
        conn.commit()
    finally:
        conn.close()

    gam = award_xp(xp_earned, f"Practice Lab: {sim['title']}")
    gam["xpEarned"] = xp_earned
    gam["correct"] = correct
    gam["total"] = total
    return gam


def get_recent_activity(limit: int = 8) -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT kind, label, xp_delta, created_at FROM activity_log "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
