import { useState } from 'react'
import { Search, Radio, Pause, Play, ArrowDownUp } from 'lucide-react'
import { CategoryTabs } from '@/components/monitoring/CategoryTabs'
import { EventTable } from '@/components/monitoring/EventTable'
import type { LiveEvent, MonitorCategory } from '@/lib/monitoringTypes'
import { useArgusStore } from '@/store/useArgusStore'

type SortDir = 'asc' | 'desc'

export function LiveMonitoring() {
  const [category, setCategory] = useState<MonitorCategory>('connections')
  const packets = useArgusStore(state => state.packets)
  const monitoringActive = useArgusStore(state => state.monitoringActive)
  const toggleMonitoring = useArgusStore(state => state.toggleMonitoring)
  
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Map raw live packets to the unified monitoring interface
  const events: LiveEvent[] = packets.map((p, i) => ({
    id: `live-${i}`,
    category: 'packets',
    timestamp: new Date().toISOString(),
    sourceIp: p.source_ip,
    destinationIp: p.destination_ip,
    protocol: p.protocol,
    status: 'normal',
    detail: `Traffic detected: ${p.source_ip} -> ${p.destination_ip}`
  }))

  const filtered = events
    .filter((e) => JSON.stringify(e).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const at = new Date(a.timestamp).getTime()
      const bt = new Date(b.timestamp).getTime()
      return sortDir === 'desc' ? bt - at : at - bt
    })

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Live Monitoring</h1>
          <p className="text-sm text-slate mt-1">Connections, ports, processes, and traffic — updated in real time.</p>
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
