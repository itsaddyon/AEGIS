import { ExternalLink, ShieldCheck, Activity, Search, ShieldAlert } from 'lucide-react'

export function ThreatDetectionLauncher() {
  function handleLaunch() {
    if (window.pywebview) {
      window.pywebview.api.launch_argus()
    } else {
      console.log('Cannot launch ARGUS: pywebview not available')
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-[#141517] p-12 flex flex-col items-center max-w-lg w-full text-center relative overflow-hidden rounded-xl border border-white/5">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-teal to-transparent" />
        
        <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mb-6 ring-4 ring-teal/5">
          <ShieldAlert className="w-10 h-10 text-teal" />
        </div>
        
        <h1 className="text-3xl font-display font-semibold mb-3 text-[#EFEDE6]">ARGUS Threat Detection</h1>
        <p className="text-slate-light text-sm leading-relaxed mb-8">
          Launch the Advanced Real-time Guardian for Unified Security (ARGUS). This powerful SOC console 
          provides live intrusion detection, rule-based alerts, and interactive case files.
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
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-[#0B0C0E] transition-all duration-200 bg-teal border border-transparent rounded-lg hover:bg-teal/90 hover:shadow-[0_0_20px_rgba(63,125,119,0.3)] focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2 focus:ring-offset-[#0B0C0E]"
        >
          <span>Launch ARGUS Subsystem</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-10 grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-white/[0.02] border border-white/5">
            <Activity className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-light">Live Monitor</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-white/[0.02] border border-white/5">
            <Search className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-light">Investigations</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-white/[0.02] border border-white/5">
            <ShieldCheck className="w-5 h-5 text-teal" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-light">Snort Engine</span>
          </div>
        </div>
      </div>
    </div>
  )
}
