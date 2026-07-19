import { ShieldCheck, Crosshair, Server } from 'lucide-react'

export function About() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-10">
      <div className="mb-8 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-teal/20 blur-[60px] rounded-full scale-150"></div>
        <img src="/logo.png" alt="CAST Logo" className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(20,184,166,0.5)]" />
      </div>

      <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal mb-2 tracking-wide">
        CAST
      </h1>
      <p className="text-slate font-mono text-xs tracking-[0.2em] uppercase mb-8 text-center">
        Cyber Awareness Simulation Trainer
      </p>

      <div className="glass-panel p-8 rounded-xl max-w-2xl text-center mb-10 text-sm text-slate leading-relaxed border-teal/10">
        CAST is an interactive, gamified educational platform designed for modern Security Operations (SecOps) training. 
        It provides deeply immersive, simulated lab environments to teach defensive strategies against social engineering, 
        malware intrusion, and password entropy exploitation.
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-12">
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <Crosshair className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Target Simulations</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            Practice identifying phishing vectors and malicious attachments in safe sandbox scenarios.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <ShieldCheck className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Defensive Posture</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            Learn to audit firewall rules and mitigate data exfiltration proactively.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <Server className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Local Telemetry</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            Your progress and certificates are securely encrypted and stored locally via SQLite.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 font-mono">
        <div className="text-[10px] text-slate-light tracking-widest uppercase">Version 1.0.0 (Education Engine)</div>
        <div className="text-[10px] text-slate-light tracking-widest uppercase mt-4">
          Designed & Developed by <span className="text-teal font-bold tracking-[0.25em] drop-shadow-[0_0_6px_rgba(20,184,166,0.35)]">ADARSH ARYA</span>
        </div>
      </div>
    </div>
  )
}
