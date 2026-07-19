import { ShieldCheck, Activity, HeartPulse, Gauge } from 'lucide-react'
import { StatusCard } from '@/components/dashboard/StatusCard'
import { ThreatTimeline } from '@/components/dashboard/ThreatTimeline'
import { RecentAlertsList } from '@/components/dashboard/RecentAlertsList'
import { useArgusStore } from '@/store/useArgusStore'
import { SEVERITY_META } from '@/lib/severity'

export function SecurityOverview() {
  const { threatLevel, monitoringActive, cases } = useArgusStore()
  const threatMeta = SEVERITY_META[threatLevel]

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Security Overview</h1>
          <p className="text-sm text-slate mt-1">Real-time posture of everything ARGUS is watching.</p>
        </div>
        <button
          onClick={() => (window as any).pywebview?.api?.simulate_attack()}
          className="flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-md text-sm font-semibold transition-colors font-mono uppercase tracking-wide border border-danger/20"
          title="Injects malicious packets to demonstrate the NIDS engine"
        >
          <Activity size={16} className="animate-pulse" />
          Simulate Threat
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatusCard label="Threat Level" value={threatMeta.label} icon={ShieldCheck}
          tone={threatLevel === 'low' ? 'good' : threatLevel === 'critical' ? 'danger' : 'warning'} />
        <StatusCard label="System Health" value={`99%`} icon={HeartPulse} tone="good" />
        <StatusCard label="Monitoring" value={monitoringActive ? 'Active' : 'Paused'} icon={Activity}
          tone={monitoringActive ? 'good' : 'warning'} sublabel="Packet Sniffer Online" />
        <StatusCard label="Live Events" value={cases.length} icon={Gauge} tone="default" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ThreatTimeline />
        </div>
        <RecentAlertsList cases={cases.slice(0, 5)} />
      </div>
    </div>
  )
}
