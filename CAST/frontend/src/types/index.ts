// Shared frontend types. Keep field names in sync with shared/CONTRACT.md
// and the dicts returned by backend/api.py.

export interface Profile {
  id: number
  user_id: string | null
  aegis_username?: string | null
  display_name: string
  theme: 'dark' | 'light'
  xp: number
  level: number
  cyber_rank: string
  safety_score: number
  streak_days: number
  last_active_on: string | null
}

export interface ActiveAlert {
  active: boolean
  threat_name?: string
  source_ip?: string
  severity?: string
  protocol?: string
  case_id?: string | null
}

export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface MissionProgress {
  id: string
  title: string
  order_index: number
  xp_reward: number
  status: MissionStatus
  quiz_score: number | null
  completed_at: string | null
}

export type SimulationCategory =
  | 'email' | 'web' | 'qr' | 'otp' | 'call' | 'usb' | 'social' | 'browser' | 'password'

export interface Simulation {
  id: string
  title: string
  category: SimulationCategory
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp_reward: number
  is_available: 0 | 1
  attempt_count?: number
}


export interface GamificationResult {
  xp: number
  level: number
  cyberRank: string
  streakDays: number
  newlyEarnedAchievements?: string[]
  xpEarned?: number
  correct?: number
  total?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned_at: string | null
}

export interface ActivityLogEntry {
  kind: string
  label: string
  xp_delta: number
  created_at: string
}

export interface Certificate {
  id: string
  display_name: string
  final_score: number
  issued_at: string
}

export interface DailyChallenge {
  challenge_date: string
  simulation_id: string
  completed: 0 | 1
}
