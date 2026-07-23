import { useState, useMemo } from 'react'
import { Search, Radio, Pause, Play, ArrowDownUp } from 'lucide-react'
import { CategoryTabs } from '@/components/monitoring/CategoryTabs'
import { EventTable } from '@/components/monitoring/EventTable'
import type { LiveEvent, MonitorCategory } from '@/lib/monitoringTypes'
import { useArgusStore } from '@/store/useArgusStore'

type SortDir = 'asc' | 'desc'

export function LiveMonitoring() {
  const [category, setCategory] = useState<MonitorCategory>('connections')
  const packets = useArgusStore(state => state.packets)
  const telemetry = useArgusStore(state => state.telemetry)
  const monitoringActive = useArgusStore(state => state.monitoringActive)
  const toggleMonitoring = useArgusStore(state => state.toggleMonitoring)
  
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Merge sniffed packets as LiveEvents with system telemetry
  const allEvents: LiveEvent[] = useMemo(() => {
    // Convert raw sniffed packets to LiveEvent format
    const packetEvents: LiveEvent[] = packets.map((p, i) => ({
      id: `pkt-${i}-${Date.now()}`,
      category: 'packets' as MonitorCategory,
      timestamp: new Date().toISOString(),
      sourceIp: p.source_ip,
      destinationIp: p.destination_ip,
      port: p.destination_port || p.source_port,
      protocol: p.protocol,
      bytes: p.bytes,
      status: 'normal' as const,
      detail: `${p.source_ip}:${p.source_port || '?'} → ${p.destination_ip}:${p.destination_port || '?'}`,
    }))

    // Telemetry events are already in the correct shape
    return [...packetEvents, ...telemetry]
  }, [packets, telemetry])

  // Filter by selected category and search query
  const filtered = useMemo(() => {
    return allEvents
      .filter((e) => {
        // For 'suspicious', show only suspicious status events from any category
        if (category === 'suspicious') return e.status === 'suspicious'
        // For 'traffic', show packets + traffic
        if (category === 'traffic') return e.category === 'traffic' || e.category === 'packets'
        // Otherwise filter by exact category
        return e.category === category
      })
      .filter((e) => {
        if (!query) return true
        return JSON.stringify(e).toLowerCase().includes(query.toLowerCase())
      })
      .sort((a, b) => {
        const at = new Date(a.timestamp).getTime()
        const bt = new Date(b.timestamp).getTime()
        return sortDir === 'desc' ? bt - at : at - bt
      })
  }, [allEvents, category, query, sortDir])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Live Monitoring</h1>
          <p className="text-sm text-slate mt-1">Connections, ports, processes, and traffic — updated in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-light">
            {allEvents.length} events tracked
          </div>
          <button
            onClick={toggleMonitoring}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors ${
              monitoringActive ? 'border-teal/40 bg-teal-soft text-forest' : 'border-border dark:border-border-dark text-slate'
            }`}
          >
            {monitoringActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {monitoringActive ? 'Live' : 'Paused'}
            {monitoringActive && <Radio className="w-3 h-3 animate-pulse text-teal" />}
          </button>
        </div>
      </div>

      <CategoryTabs active={category} onChange={setCategory} />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this feed..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border dark:border-border-dark
                       bg-surface dark:bg-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border
                     dark:border-border-dark text-sm text-slate hover:bg-surface-muted"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      <EventTable category={category} events={filtered} />
    </div>
  )
}
