import { useState, type ReactNode } from 'react'

/** Simple hover tooltip for explaining unfamiliar security terms inline. */
export function Tooltip({ term, children }: { term: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-block cursor-help border-b border-dotted border-teal"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {term}
      {open && (
        <span className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl surface p-3 text-xs text-muted shadow-card">
          {children}
        </span>
      )}
    </span>
  )
}
