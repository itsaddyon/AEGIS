import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'warning' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'surface text-muted',
  accent: 'bg-accent-soft text-teal',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </span>
  )
}
