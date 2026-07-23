import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Calendar, ChevronDown, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useArgusStore } from '@/store/useArgusStore'
import { SEVERITY_META } from '@/lib/severity'
import type { Severity, CaseStatus } from '@/lib/types'
import clsx from 'clsx'

const STATUS_OPTIONS: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'contained', label: 'Contained' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const SEVERITY_OPTIONS: { value: Severity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function IncidentHistory() {
  const cases = useArgusStore(state => state.cases)
  const fetchCases = useArgusStore(state => state.fetchCases)
  useEffect(() => { fetchCases() }, [fetchCases])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const q = query.toLowerCase()
      const matchesQuery = !q ||
        (c.threatName || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.sourceIp || '').toLowerCase().includes(q) ||
        (c.destinationIp || '').toLowerCase().includes(q)
      
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter
      
      return matchesQuery && matchesStatus && matchesSeverity
    })
  }, [cases, query, statusFilter, severityFilter])

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach(c => {
      const date = c.openedAt ? new Date(c.openedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'
      if (!groups[date]) groups[date] = []
      groups[date].push(c)
    })
    return Object.entries(groups)
  }, [filtered])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-display font-semibold">Incident History</h1>
        <p className="text-sm text-slate mt-1">Complete audit trail of all threat investigations — chronological, searchable, and filterable.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by threat, case ID, or IP..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border dark:border-border-dark
                       bg-surface dark:bg-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </div>
        <div className="relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="pl-8 pr-8 py-2 rounded-md border border-border dark:border-border-dark bg-surface dark:bg-charcoal text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal/40 appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
        </div>
        <div className="relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as any)}
            className="pl-8 pr-8 py-2 rounded-md border border-border dark:border-border-dark bg-surface dark:bg-charcoal text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal/40 appearance-none cursor-pointer"
          >
            {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
        </div>
        <div className="text-xs font-mono text-slate-light ml-auto">
          {filtered.length} of {cases.length} incidents
        </div>
      </div>

      {/* Timeline grouped by date */}
      {grouped.length > 0 ? (
        <div className="flex flex-col gap-6">
          {grouped.map(([date, dateCases]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-teal" />
                <span className="text-sm font-display font-semibold text-teal">{date}</span>
                <span className="text-xs text-slate font-mono">({dateCases.length} incidents)</span>
              </div>
              <div className="glass-panel rounded-lg overflow-hidden shadow-panel">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-border-dark text-left text-xs text-slate">
                      <th className="px-4 py-2.5 font-medium w-20">Time</th>
                      <th className="px-4 py-2.5 font-medium w-32">Case ID</th>
                      <th className="px-4 py-2.5 font-medium">Threat</th>
                      <th className="px-4 py-2.5 font-medium w-28">Source IP</th>
                      <th className="px-4 py-2.5 font-medium w-20">Severity</th>
                      <th className="px-4 py-2.5 font-medium w-24">Status</th>
                      <th className="px-4 py-2.5 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-border-dark">
                    {dateCases.map(c => {
                      const meta = SEVERITY_META[c.severity] ?? SEVERITY_META.low
                      const statusColors: Record<string, string> = {
                        new: 'text-blue-400',
                        investigating: 'text-burnt',
                        contained: 'text-warning',
                        resolved: 'text-olive',
                        dismissed: 'text-slate',
                      }
                      return (
                        <tr key={c.id} className="hover:bg-surface-muted dark:hover:bg-graphite/40 transition-colors">
                          <td className="px-4 py-2.5 text-xs text-slate-light font-mono whitespace-nowrap">
                            {c.openedAt ? new Date(c.openedAt).toLocaleTimeString() : '—'}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-teal whitespace-nowrap">{c.id}</td>
                          <td className="px-4 py-2.5 font-medium truncate max-w-[200px]">{c.threatName}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-slate-light whitespace-nowrap">{c.sourceIp || '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className={clsx('aegis-badge text-[10px]', meta.badgeClass)}>{meta.label}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={clsx('text-xs font-mono uppercase tracking-wider', statusColors[c.status] || 'text-slate')}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <Link to={`/cases/${encodeURIComponent(c.id)}`} className="text-slate hover:text-teal transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-lg p-12 text-center">
          <div className="text-slate text-sm">
            {cases.length === 0
              ? 'No incidents have been recorded yet. Threat events will appear here as they are detected.'
              : 'No incidents match your current filters.'}
          </div>
        </div>
      )}
    </div>
  )
}
