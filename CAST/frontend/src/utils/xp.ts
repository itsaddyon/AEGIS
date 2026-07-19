// XP/level helpers mirrored from services/gamification_service.py so the
// UI can render progress bars without waiting on a backend round-trip.

export const LEVEL_THRESHOLDS = [0, 150, 350, 600, 900, 1300, 1800, 2400, 3100, 4000]

export function levelForXp(xp: number): number {
  let level = 1
  LEVEL_THRESHOLDS.forEach((threshold, i) => {
    if (xp >= threshold) level = i + 1
  })
  return level
}

export function xpProgressWithinLevel(xp: number): { current: number; needed: number; pct: number } {
  const level = levelForXp(xp)
  const floor = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const needed = Math.max(nextThreshold - floor, 1)
  const current = Math.min(xp - floor, needed)
  return { current, needed, pct: Math.round((current / needed) * 100) }
}
