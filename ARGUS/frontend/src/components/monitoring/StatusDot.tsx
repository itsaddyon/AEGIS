import clsx from 'clsx'

const DOT: Record<string, string> = {
  normal: 'bg-olive',
  watch: 'bg-burnt',
  suspicious: 'bg-crimson',
}

export function StatusDot({ status }: { status: 'normal' | 'watch' | 'suspicious' }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('w-1.5 h-1.5 rounded-full', DOT[status])} />
      <span className="text-xs capitalize text-slate">{status}</span>
    </span>
  )
}
