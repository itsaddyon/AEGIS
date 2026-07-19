"""Achievement-unlock rule checks, run after XP-earning actions."""
from __future__ import annotations

from database.db import get_connection


def check_and_award(trigger: str, context: dict) -> list[str]:
    """Evaluate simple rule-based achievements. Returns newly-earned ids."""
    conn = get_connection()
    newly_earned: list[str] = []
    try:
        earned = {
            r["achievement_id"]
            for r in conn.execute("SELECT achievement_id FROM user_achievements")
        }

        candidates = []
        if trigger == "mission_complete" and "first-steps" not in earned:
            candidates.append("first-steps")
        if trigger == "simulation_attempt" and context.get("simulation_id") == "fake-inbox":
            if context.get("correct") == context.get("total") and "perfect-inbox" not in earned:
                candidates.append("perfect-inbox")
        if trigger == "streak" and context.get("streak_days", 0) >= 7 and "week-streak" not in earned:
            candidates.append("week-streak")
        if trigger == "final_assessment" and "cyber-graduate" not in earned:
            candidates.append("cyber-graduate")

        for achievement_id in candidates:
            conn.execute(
                "INSERT OR IGNORE INTO user_achievements (achievement_id) VALUES (?)",
                (achievement_id,),
            )
            newly_earned.append(achievement_id)
        conn.commit()
    finally:
        conn.close()
    return newly_earned
