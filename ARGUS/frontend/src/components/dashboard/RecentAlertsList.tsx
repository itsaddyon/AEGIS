import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CaseFile } from '@/lib/types'
import { SEVERITY_META } from '@/lib/severity'

export function RecentAlertsList({ cases }: { cases: CaseFile[] }) {
  return (
    <div className="aegis-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Recent Alerts</div>
        <Link to="/cases" className="text-xs text-teal hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-border dark:divide-border-dark">
        {cases.map((c) => {
          const meta = SEVERITY_META[c.severity]
          return (
            <Link
              key={c.id}
              to={`/cases/${c.id}`}
              className="flex items-center justify-between py-2.5 hover:bg-surface-muted
                         dark:hover:bg-graphite/50 rounded-md px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                <div>
                  <div className="text-sm font-medium">{c.threatName}</div>
                  <div className="text-xs text-slate">{c.id} · {c.confidence}% confidence</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-light" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
