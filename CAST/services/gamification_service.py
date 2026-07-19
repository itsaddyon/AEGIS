"""XP, levels, streaks and Cyber Rank math."""
from __future__ import annotations

import datetime as dt

from database.db import get_connection

# Level thresholds: index = level - 1, value = cumulative XP required.
LEVEL_THRESHOLDS = [0, 150, 350, 600, 900, 1300, 1800, 2400, 3100, 4000]

RANKS = [
    (0, "Novice"),
    (350, "Aware Learner"),
    (900, "Vigilant Analyst"),
    (1800, "Threat Spotter"),
    (3100, "Cyber Guardian"),
]


def level_for_xp(xp: int) -> int:
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
    return level


def rank_for_xp(xp: int) -> str:
    rank = RANKS[0][1]
    for threshold, name in RANKS:
        if xp >= threshold:
            rank = name
    return rank


def award_xp(xp_delta: int, label: str) -> dict:
    """Add XP to the local profile, recompute level/rank/streak, log it."""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM user_profile WHERE id = 1").fetchone()
        new_xp = row["xp"] + xp_delta
        new_level = level_for_xp(new_xp)
        new_rank = rank_for_xp(new_xp)
        streak = _update_streak(conn, row)

        conn.execute(
            """UPDATE user_profile
               SET xp = ?, level = ?, cyber_rank = ?, streak_days = ?,
                   last_active_on = ?
               WHERE id = 1""",
            (new_xp, new_level, new_rank, streak, dt.date.today().isoformat()),
        )
        conn.execute(
            "INSERT INTO activity_log (kind, label, xp_delta) VALUES (?, ?, ?)",
            ("xp_award", label, xp_delta),
        )
        conn.commit()
        return {
            "xp": new_xp,
            "level": new_level,
            "cyberRank": new_rank,
            "streakDays": streak,
        }
    finally:
        conn.close()


def _update_streak(conn, row) -> int:
    today = dt.date.today()
    last = row["last_active_on"]
    if not last:
        return 1
    last_date = dt.date.fromisoformat(last)
    delta = (today - last_date).days
    if delta == 0:
        return row["streak_days"] or 1
    if delta == 1:
        return (row["streak_days"] or 0) + 1
    return 1  # streak broken, restart
