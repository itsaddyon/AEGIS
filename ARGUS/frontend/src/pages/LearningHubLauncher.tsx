import { ExternalLink, GraduationCap, Trophy, BookOpen, Target } from 'lucide-react'

export function LearningHubLauncher() {
  function handleLaunch() {
    // Phase 3: Launch CAST through PyWebView bridge
    if ((window as any).pywebview) {
      (window as any).pywebview.api.launch_cast()
    } else {
      console.log('Cannot launch CAST: pywebview not available')
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-panel p-12 flex flex-col items-center max-w-lg w-full text-center relative overflow-hidden rounded-xl border-olive/20">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-olive to-transparent" />
        
        <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center mb-6 ring-4 ring-olive/5">
          <GraduationCap className="w-10 h-10 text-olive" />
        </div>
        
        <h1 className="text-3xl font-display font-semibold mb-3 text-charcoal dark:text-canvas">CAST Learning Hub</h1>
        <p className="text-slate dark:text-slate-light text-sm leading-relaxed mb-8">
          Launch the Cyber Awareness & Security Training (CAST) suite. Access interactive modules, 
          certifications, and simulated social engineering defenses.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-left max-w-sm flex flex-col gap-1">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Ecosystem Setup Required
          </span>
          <span className="text-slate-light text-[11px] leading-relaxed">
            This module uses Optional Ecosystem Interoperability. To launch it, you must have cloned the full AEGIS repository so all projects sit adjacently. See the <a href="https://github.com/itsaddyon/Codealpha_AEGIS" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Setup Guide</a>.
          </span>
        </div>

        <button 
          onClick={handleLaunch}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all duration-200 bg-olive border border-transparent rounded-lg hover:bg-olive/80 focus:outline-none focus:ring-2 focus:ring-olive/50 focus:ring-offset-2"
        >
          <span>Launch CAST Subsystem</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-10 grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <BookOpen className="w-5 h-5 text-olive" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">Missions</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <Target className="w-5 h-5 text-olive" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">Simulations</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded bg-surface-muted dark:bg-charcoal/50">
            <Trophy className="w-5 h-5 text-olive" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate">Certificates</span>
          </div>
        </div>
      </div>
    </div>
  )
}
