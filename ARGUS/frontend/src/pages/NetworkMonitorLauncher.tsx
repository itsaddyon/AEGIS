import { ExternalLink, Network, ShieldCheck, Radar } from 'lucide-react'

export function NetworkMonitorLauncher() {
  function handleLaunch() {
    // Phase 3: Launch VISTA through PyWebView bridge
    if ((window as any).pywebview) {
      (window as any).pywebview.api.launch_vista()
    } else {
      console.log('Cannot launch VISTA: pywebview not available')
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-panel p-12 flex flex-col items-center max-w-lg w-full text-center relative overflow-hidden rounded-xl border-teal/20">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-teal to-transparent" />
        
        <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mb-6 ring-4 ring-teal/5">
          <Network className="w-10 h-10 text-teal" />
        </div>
        
        <h1 className="text-3xl font-display font-semibold mb-3 text-charcoal dark:text-canvas">VISTA Network Monitor</h1>
        <p className="text-slate dark:text-slate-light text-sm leading-relaxed mb-8">
          Launch the Visual Interactive System for Traffic Analysis (VISTA). This dedicated module 
          provides deep-packet inspection, live bandwidth mapping, and geographic IP tracing.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-left max-w-sm flex flex-col gap-1">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Ecosystem Setup Required
          </span>
          <span className="text-slate-light text-[11px] leading-relaxed">
            This module uses Optional Ecosystem Interoperability. To launch it, you must have cloned the full AEGIS repository so all projects sit adjacently. See the <a href="https://github.com/itsaddyon/AEGIS" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Setup Guide</a>.
          </span>
        </div>

        <button 
          onClick={handleLaunch}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all duration-200 bg-teal border border-transparent rounded-lg hover:bg-teal-muted focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2"
        >
          <span>Launch VISTA Subsystem</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-10 grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <Radar className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">Live Packets</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <ShieldCheck className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">DDoS Protect</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <Network className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">Geo Routing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
