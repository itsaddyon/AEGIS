import { useParams, useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SIMULATIONS } from '@/data/simulations'

/**
 * Stub screen for simulations not yet built (QR, OTP, phone call, USB,
 * social-engineering chat, browser warning, password lab).
 *
 * To bring one to life: copy the pattern in FakeInboxSimulation.tsx or
 * FakeWebsiteSimulation.tsx — a data file of rounds in `src/data/`, local
 * state for index/verdict/correctCount, and a call to
 * `getApi().submit_simulation_result(id, correct, total)` at the end —
 * then flip `is_available` to 1 for that id in `src/data/simulations.ts`
 * and `database/schema.sql`, and add a route for it in `App.tsx`.
 */
export function ComingSoonSimulation() {
  const { simId = '' } = useParams()
  const navigate = useNavigate()
  const sim = SIMULATIONS.find((s) => s.id === simId)

  return (
    <div className="mx-auto max-w-lg text-center">
      <FlaskConical size={36} className="mx-auto text-muted" />
      <h1 className="mt-4 font-display text-2xl font-semibold">{sim?.title ?? 'Simulation'}</h1>
      <p className="mt-2 text-muted">This simulation is scaffolded but not built yet.</p>
      <Card className="mt-6 text-left text-sm text-muted">
        Category: {sim?.category} · Difficulty: {sim?.difficulty} · Reward: {sim?.xp_reward} XP
      </Card>
      <Button className="mt-6" variant="secondary" onClick={() => navigate('/practice-lab')}>
        Back to Practice Lab
      </Button>
    </div>
  )
}
