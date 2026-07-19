import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bookmark, Download, Lightbulb } from 'lucide-react'
import clsx from 'clsx'
import { useArgusStore } from '@/store/useArgusStore'
import { SEVERITY_META } from '@/lib/severity'

export function CaseDetail() {
  const { id } = useParams()
  const cases = useArgusStore(state => state.cases)
  const c = cases.find((x) => x.id === decodeURIComponent(id ?? ''))

  if (!c) {
    return <div className="text-sm text-slate">Case not found.</div>
  }

  const meta = SEVERITY_META[c.severity]

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <Link to="/cases" className="flex items-center gap-1 text-sm text-slate hover:text-teal w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Case Files
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate">{c.id}</div>
          <h1 className="text-2xl font-display font-semibold mt-1">{c.threatName}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={clsx('aegis-badge', meta.badgeClass)}>{meta.label} severity</span>
            <span className="text-xs text-slate">{c.confidence}% confidence</span>
            <span className="text-xs capitalize text-slate">Status: {c.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md border border-border dark:border-border-dark hover:bg-surface-muted">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-teal text-white text-sm hover:bg-teal-muted">
            <Download className="w-4 h-4" /> Export Case
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4 bg-teal-soft/40 dark:bg-teal/5 border-teal/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-teal" />
        <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-teal dark:text-teal mb-2 uppercase">
          <Lightbulb className="w-4 h-4" /> What happened, in plain English
        </div>
        <p className="text-sm leading-relaxed">{c.lesson.plainEnglish}</p>
        <p className="text-sm leading-relaxed mt-2 italic text-slate">"{c.lesson.analogy}"</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-lg p-4">
          <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider border-b border-border dark:border-border-dark pb-2">Technical Details</div>
          <dl className="text-sm space-y-3">
            <div className="flex justify-between border-b border-border dark:border-border-dark/50 pb-1"><dt className="text-slate">Source IP</dt><dd className="font-mono text-teal">{c.sourceIp}</dd></div>
            <div className="flex justify-between border-b border-border dark:border-border-dark/50 pb-1"><dt className="text-slate">Destination IP</dt><dd className="font-mono text-teal">{c.destinationIp}</dd></div>
            <div className="flex justify-between border-b border-border dark:border-border-dark/50 pb-1"><dt className="text-slate">Ports</dt><dd className="font-mono">{c.ports.join(', ')}</dd></div>
            <div className="flex justify-between border-b border-border dark:border-border-dark/50 pb-1"><dt className="text-slate">Protocol</dt><dd className="font-mono">{c.protocol}</dd></div>
          </dl>
        </div>
        <div className="glass-panel rounded-lg p-4 border border-warning/30 bg-warning/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-crimson" />
          <div className="text-sm font-mono uppercase text-warning mb-4 tracking-wider">Active Response Mechanisms</div>
          <ul className="text-sm space-y-2 list-none text-charcoal dark:text-cream mb-4">
            {c.recommendedResponse.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-warning mt-1">▸</span> {r}
              </li>
            ))}
          </ul>
          {/* TASK 4.4: Active Response Mitigation Buttons */}
          <div className="flex gap-2 mt-auto">
             <button className="flex-1 py-1.5 rounded bg-warning hover:bg-warning/80 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-warning">
               Block Source IP
             </button>
             <button className="flex-1 py-1.5 rounded border border-warning/50 text-warning hover:bg-warning/10 text-xs font-bold uppercase tracking-wider transition-colors">
               Isolate Host
             </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4">
        <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider">How It Works &amp; Defense</div>
        <p className="text-sm leading-relaxed"><span className="font-medium text-teal">How it works: </span>{c.lesson.howItWorks}</p>
        <p className="text-sm leading-relaxed mt-2"><span className="font-medium text-teal">Why attackers do this: </span>{c.lesson.whyAttackersDoIt}</p>
        <p className="text-sm leading-relaxed mt-2"><span className="font-medium text-teal">How to defend: </span>{c.lesson.howToDefend}</p>
      </div>

      <div className="glass-panel rounded-lg p-4">
        <div className="text-sm font-mono uppercase text-slate-light mb-4 tracking-wider">Evidence Timeline</div>
        <div className="flex flex-col gap-4 relative">
          <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border dark:bg-border-dark" />
          {c.evidence.map((e) => (
            <div key={e.id} className="flex gap-4 text-sm relative z-10">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-teal ring-4 ring-canvas dark:ring-graphite shrink-0" />
              <div className="bg-surface dark:bg-charcoal border border-border dark:border-border-dark p-3 rounded-md w-full">
                <div className="font-medium text-teal">{e.label}</div>
                <div className="text-slate dark:text-slate-light text-xs mt-1 font-mono leading-relaxed">{e.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
