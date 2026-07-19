import { useParams, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const LABELS: Record<string, string> = {
  'network-monitor': 'Network Monitor',
  'threat-detection': 'Threat Detection',
}

/** Placeholder for nav items reserved for future VISTA/Sentinel integration. */
export function ComingSoon() {
  const { feature = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md text-center pt-16">
      <Lock size={32} className="mx-auto text-muted" />
      <h1 className="mt-4 font-display text-2xl font-semibold">{LABELS[feature] ?? 'Coming Soon'}</h1>
      <p className="mt-2 text-muted text-sm">
        This capability is reserved for a future release of the Cybersecurity Software Suite.
      </p>
      <Button className="mt-6" variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  )
}
