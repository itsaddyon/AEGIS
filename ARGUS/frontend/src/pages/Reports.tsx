import { useEffect } from 'react'
import { FileText, Shield, AlertTriangle, CheckCircle, TrendingUp, Download, Clock } from 'lucide-react'
import { useArgusStore } from '@/store/useArgusStore'
import { SEVERITY_META } from '@/lib/severity'
import type { Severity } from '@/lib/types'

export function Reports() {
  const cases = useArgusStore(state => state.cases)
  const fetchCases = useArgusStore(state => state.fetchCases)
  useEffect(() => { fetchCases() }, [fetchCases])

  // Compute metrics
  const total = cases.length
  const resolved = cases.filter(c => c.status === 'resolved').length
  const dismissed = cases.filter(c => c.status === 'dismissed').length
  const active = total - resolved - dismissed
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Severity distribution
  const severityCounts: Record<Severity, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  cases.forEach(c => { severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1 })

  // Top attack vectors (by threat name)
  const threatMap: Record<string, number> = {}
  cases.forEach(c => { threatMap[c.threatName] = (threatMap[c.threatName] || 0) + 1 })
  const topThreats = Object.entries(threatMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Top targeted ports
  const portMap: Record<number, number> = {}
  cases.forEach(c => { (c.ports || []).forEach(p => { portMap[p] = (portMap[p] || 0) + 1 }) })
  const topPorts = Object.entries(portMap).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 8)

  // Top source IPs
  const ipMap: Record<string, number> = {}
  cases.forEach(c => { if (c.sourceIp) ipMap[c.sourceIp] = (ipMap[c.sourceIp] || 0) + 1 })
  const topSourceIPs = Object.entries(ipMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Security Reports</h1>
          <p className="text-sm text-slate mt-1">Executive summary of all recorded threat intelligence.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-teal text-white text-sm hover:bg-teal-muted transition-colors"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate text-xs font-mono uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" /> Total Cases
          </div>
          <div className="text-3xl font-display font-bold text-charcoal dark:text-canvas">{total}</div>
        </div>
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate text-xs font-mono uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Active
          </div>
          <div className="text-3xl font-display font-bold text-warning">{active}</div>
        </div>
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate text-xs font-mono uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4 text-olive" /> Resolved
          </div>
          <div className="text-3xl font-display font-bold text-olive">{resolved}</div>
        </div>
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate text-xs font-mono uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-teal" /> Resolution Rate
          </div>
          <div className="text-3xl font-display font-bold text-teal">{resolutionRate}%</div>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="glass-panel rounded-lg p-5">
        <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">
          <Shield className="w-4 h-4 inline mr-2" />Threat Severity Distribution
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(severityCounts) as Severity[]).map(sev => {
            const meta = SEVERITY_META[sev]
            const count = severityCounts[sev]
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={sev} className="relative overflow-hidden rounded-lg border border-border dark:border-border-dark p-4">
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${pct}%`, background: sev === 'critical' ? '#e74c3c' : sev === 'high' ? '#f39c12' : sev === 'medium' ? '#e67e22' : '#2ecc71' }} />
                <div className={`text-xs font-mono uppercase tracking-wider mb-1 ${meta.badgeClass.includes('text-') ? meta.badgeClass.split(' ').find(c => c.startsWith('text-')) : 'text-slate'}`}>
                  {meta.label}
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-slate mt-1">{pct}% of total</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Attack Vectors */}
        <div className="glass-panel rounded-lg p-5">
          <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">
            Top Attack Vectors
          </div>
          {topThreats.length > 0 ? (
            <div className="space-y-3">
              {topThreats.map(([name, count], i) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate mr-2">{name}</span>
                      <span className="text-slate text-xs font-mono shrink-0">{count}x ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-muted dark:bg-charcoal rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `hsl(${180 - i * 30}, 60%, 50%)` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-slate py-8 text-center">No threat data recorded yet.</div>
          )}
        </div>

        {/* Top Source IPs */}
        <div className="glass-panel rounded-lg p-5">
          <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">
            Top Source IPs (Attackers)
          </div>
          {topSourceIPs.length > 0 ? (
            <div className="space-y-3">
              {topSourceIPs.map(([ip, count]) => (
                <div key={ip} className="flex justify-between items-center text-sm border-b border-border dark:border-border-dark/50 pb-2">
                  <span className="font-mono text-teal">{ip}</span>
                  <span className="text-xs text-slate font-mono">{count} incidents</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate py-8 text-center">No source IP data.</div>
          )}
        </div>
      </div>

      {/* Top Targeted Ports */}
      <div className="glass-panel rounded-lg p-5">
        <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">
          Most Targeted Ports
        </div>
        {topPorts.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {topPorts.map(([port, count]) => (
              <div key={port} className="px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-surface-muted dark:bg-charcoal">
                <div className="text-lg font-mono font-bold text-teal">{port}</div>
                <div className="text-[10px] text-slate uppercase tracking-wider">{count} hits</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate py-4 text-center">No port data recorded yet.</div>
        )}
      </div>

      {/* Recent Timeline */}
      <div className="glass-panel rounded-lg p-5">
        <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">
          <Clock className="w-4 h-4 inline mr-2" />Recent Activity
        </div>
        <div className="space-y-2">
          {cases.slice(0, 10).map(c => {
            const meta = SEVERITY_META[c.severity] ?? SEVERITY_META.low
            return (
              <div key={c.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border dark:border-border-dark/30">
                <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                <span className="font-mono text-xs text-slate-light w-40 shrink-0">{c.openedAt ? new Date(c.openedAt).toLocaleString() : '—'}</span>
                <span className="font-medium truncate">{c.threatName}</span>
                <span className={`aegis-badge text-[10px] ml-auto shrink-0 ${meta.badgeClass}`}>{meta.label}</span>
                <span className="text-[10px] uppercase text-slate font-mono shrink-0">{c.status}</span>
              </div>
            )
          })}
          {cases.length === 0 && (
            <div className="text-sm text-slate py-8 text-center">No incidents to report yet. Run a threat simulation or monitor live traffic.</div>
          )}
        </div>
      </div>
    </div>
  )
}
