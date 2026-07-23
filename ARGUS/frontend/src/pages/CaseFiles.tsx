import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { CaseCard } from '@/components/cases/CaseCard'
import { useArgusStore } from '@/store/useArgusStore'

export function CaseFiles() {
  const cases = useArgusStore(state => state.cases)
  const fetchCases = useArgusStore(state => state.fetchCases)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

  useEffect(() => { fetchCases() }, [fetchCases])

  const filtered = cases.filter((c) => {
    const name = (c.threatName || '').toLowerCase()
    const id = (c.id || '').toLowerCase()
    const q = query.toLowerCase()
    const matchesQuery = name.includes(q) || id.includes(q)
    
    let matchesFilter = true
    if (filter === 'active') matchesFilter = c.status !== 'resolved' && c.status !== 'dismissed'
    if (filter === 'resolved') matchesFilter = c.status === 'resolved'
    
    return matchesQuery && matchesFilter
  })

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Case Files</h1>
          <p className="text-sm text-slate mt-1">Every investigation ARGUS has opened, in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors ${
                filter === f
                  ? 'bg-teal/15 text-teal border border-teal/30'
                  : 'text-slate hover:bg-surface-muted border border-transparent'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search case files..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-border dark:border-border-dark
                     bg-surface dark:bg-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((c) => <CaseCard key={c.id} c={c} />)}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate py-12">
            {cases.length === 0
              ? 'No case files recorded yet. Run a threat simulation or monitor live traffic to generate incidents.'
              : 'No case files match your search.'}
          </div>
        )}
      </div>
    </div>
  )
}
