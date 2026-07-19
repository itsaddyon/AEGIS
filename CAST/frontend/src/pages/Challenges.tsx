import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getApi } from '@/lib/api'
import { SIMULATIONS } from '@/data/simulations'
import type { DailyChallenge } from '@/types'

export function Challenges() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)

  useEffect(() => { getApi().get_daily_challenge().then(setChallenge) }, [])

  const sim = SIMULATIONS.find((s) => s.id === challenge?.simulation_id)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight flex items-center gap-2">
        <Trophy size={26} /> Daily Challenge
      </h1>
      <p className="mt-1 text-muted">A new scenario every day — keeps your streak alive.</p>

      {sim && (
        <Link to={`/practice-lab/${sim.id}`}>
          <Card className="mt-6 hover:brightness-110 transition">
            <div className="flex items-center justify-between">
              <div className="font-medium">{sim.title}</div>
              <Badge tone="accent">{sim.xp_reward} XP</Badge>
            </div>
            <div className="mt-1 text-xs text-muted capitalize">{sim.category} · {sim.difficulty}</div>
          </Card>
        </Link>
      )}
    </div>
  )
}
