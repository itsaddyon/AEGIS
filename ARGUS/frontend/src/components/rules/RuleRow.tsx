import { useState } from 'react'
import { Copy, Pencil, Trash2, FlaskConical, Download, MoreVertical } from 'lucide-react'
import clsx from 'clsx'
import type { DetectionRule } from '@/lib/rulesTypes'
import { SEVERITY_META } from '@/lib/severity'
import { ToggleSwitch } from './ToggleSwitch'

interface Props {
  rule: DetectionRule
  onToggle: (id: string, enabled: boolean) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
  onEdit: (id: string) => void
  onExport: (id: string) => void
}

export function RuleRow({ rule, onToggle, onDuplicate, onDelete, onTest, onEdit, onExport }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta = SEVERITY_META[rule.severity]

  return (
    <div className="glass-panel rounded-lg p-4 flex items-center justify-between shadow-panel hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <ToggleSwitch checked={rule.enabled} onChange={(v) => onToggle(rule.id, v)} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-charcoal dark:text-cream truncate">{rule.name}</span>
            <span className={clsx('aegis-badge', meta.badgeClass)}>{meta.label}</span>
          </div>
          <div className="text-xs text-slate mt-0.5 truncate">{rule.description}</div>
          <div className="text-[10px] font-mono text-slate-light mt-1 uppercase">Module: {rule.module}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative">
        <button onClick={() => onTest(rule.id)} title="Test Rule"
          className="p-2 rounded-md hover:bg-surface-muted dark:hover:bg-charcoal">
          <FlaskConical className="w-4 h-4 text-slate hover:text-teal" />
        </button>
        <button onClick={() => onEdit(rule.id)} title="Edit Rule"
          className="p-2 rounded-md hover:bg-surface-muted dark:hover:bg-charcoal">
          <Pencil className="w-4 h-4 text-slate hover:text-teal" />
        </button>
        <button onClick={() => setMenuOpen((o) => !o)} title="More"
          className="p-2 rounded-md hover:bg-surface-muted dark:hover:bg-charcoal">
          <MoreVertical className="w-4 h-4 text-slate" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 glass-panel py-1 shadow-card rounded-md">
            <button
              onClick={() => { onDuplicate(rule.id); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-muted dark:hover:bg-charcoal/60 text-left text-slate dark:text-cream"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={() => { onExport(rule.id); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-muted dark:hover:bg-charcoal/60 text-left text-slate dark:text-cream"
            >
              <Download className="w-3.5 h-3.5" /> Export Rule
            </button>
            <button
              onClick={() => { onDelete(rule.id); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-crimson hover:bg-crimson/10 text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
