export function ProgressBar({ pct, colorClass = 'bg-teal' }: { pct: number; colorClass?: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="h-2 w-full rounded-full surface-sunken overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
