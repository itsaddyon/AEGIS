import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { getApi } from '@/lib/api'
import type { ActiveAlert } from '@/types'

// Cross-app live threat banner. ARGUS writes active_alert.json on any
// HIGH/CRITICAL case; this polls it every 5s and shows a pulsing red
// banner. Dismissing here only hides it locally in CAST — the ARGUS
// case stays open until resolved there.
export function ThreatAlertBanner() {
  const [alert, setAlert] = useState<ActiveAlert | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const api = getApi()

    async function poll() {
      try {
        const result = await api.get_active_alert()
        if (!cancelled) setAlert(result)
      } catch {
        if (!cancelled) setAlert(null)
      }
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!alert?.active) return null
  const key = `${alert.case_id ?? ''}-${alert.threat_name ?? ''}`
  if (dismissed === key) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/15 border-b border-red-500/30 text-red-400 animate-pulse">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="text-xs font-mono flex-1 min-w-0 truncate">
        ⚠ ARGUS ALERT — {alert.threat_name || 'Unknown threat'} from {alert.source_ip || 'unknown source'}
      </span>
      <button
        onClick={() => setDismissed(key)}
        className="p-1 rounded hover:bg-red-500/20 shrink-0"
        title="Dismiss (case stays open in ARGUS)"
      >
        <X size={14} />
      </button>
    </div>
  )
}
