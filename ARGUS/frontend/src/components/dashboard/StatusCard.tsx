import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface StatusCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'default' | 'good' | 'warning' | 'danger'
  sublabel?: string
}

const toneClasses: Record<NonNullable<StatusCardProps['tone']>, string> = {
  default: 'text-teal bg-teal-soft',
  good: 'text-olive bg-olive/15',
  warning: 'text-warning bg-warning/15',
  danger: 'text-crimson bg-crimson/15',
}

export function StatusCard({ label, value, icon: Icon, tone = 'default', sublabel }: StatusCardProps) {
  const isGlow = tone !== 'default';
  return (
    <div className={`glass-panel p-4 flex items-start gap-3 rounded-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isGlow ? `glow-${tone}` : ''}`}>
      <div className={clsx('p-2 rounded-md z-10 relative', toneClasses[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="z-10 relative">
        <div className="text-xs font-mono tracking-wider text-slate uppercase">{label}</div>
        <div className="text-xl font-display font-semibold text-charcoal dark:text-canvas mt-0.5">{value}</div>
        {sublabel && <div className="text-[10px] text-slate-light font-mono mt-0.5">{sublabel}</div>}
      </div>
    </div>
  )
}
