import clsx from 'clsx'
import type { MonitorCategory } from '@/lib/monitoringTypes'
import { CATEGORY_LABELS } from '@/lib/monitoringTypes'

const ORDER: MonitorCategory[] = [
  'connections', 'ports', 'processes', 'traffic', 'devices', 'packets', 'suspicious',
]

export function CategoryTabs({ active, onChange }: {
  active: MonitorCategory
  onChange: (c: MonitorCategory) => void
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border dark:border-border-dark">
      {ORDER.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={clsx(
            'px-3 py-2 text-sm border-b-2 -mb-px transition-colors',
            active === cat
              ? 'border-teal text-forest dark:text-teal-soft font-medium'
              : 'border-transparent text-slate hover:text-charcoal dark:hover:text-cream'
          )}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
