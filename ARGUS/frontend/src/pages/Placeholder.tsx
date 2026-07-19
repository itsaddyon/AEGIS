import { Construction } from 'lucide-react'

// Used for sections planned in ARGUS's structure but not yet built
// in this phase (Live Monitoring, Rules Engine, Reports, etc.)
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center py-24">
      <Construction className="w-8 h-8 text-slate-light mb-3" />
      <h1 className="text-xl font-display font-semibold">{title}</h1>
      <p className="text-sm text-slate mt-2">
        This section is scaffolded and scheduled for the next build phase.
      </p>
    </div>
  )
}
