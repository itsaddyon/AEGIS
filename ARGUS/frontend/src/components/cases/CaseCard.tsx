import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import clsx from 'clsx'
import type { CaseFile } from '@/lib/types'
import { SEVERITY_META } from '@/lib/severity'

export function CaseCard({ c }: { c: CaseFile }) {
  const meta = SEVERITY_META[c.severity]
  return (
    <Link to={`/cases/${c.id}`} className="glass-panel p-4 flex items-center justify-between block rounded-lg hover:-translate-y-1 transition-all duration-300 shadow-panel">
      <div className="flex items-center gap-4">
        <span className={clsx('w-2.5 h-2.5 rounded-full ring-2 ring-canvas dark:ring-graphite', meta.dotClass)} />
        <div>
          <div className="text-sm font-display font-medium text-charcoal dark:text-cream">{c.threatName}</div>
          <div className="text-xs text-slate mt-0.5 font-mono tracking-wide">{c.id} · Opened {new Date(c.openedAt).toLocaleTimeString()}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={clsx('aegis-badge', meta.badgeClass)}>{meta.label}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-light">{c.confidence}% confidence</span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-light">{c.status}</span>
        {c.bookmarked && <Bookmark className="w-4 h-4 text-teal fill-teal" />}
      </div>
    </Link>
  )
}
