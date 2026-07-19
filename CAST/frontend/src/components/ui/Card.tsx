import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`surface rounded-2xl shadow-subtle p-5 ${className}`}>
      {children}
    </div>
  )
}
