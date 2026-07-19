import { Network, Cpu, Lock } from 'lucide-react'

export function About() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-10">
      <div className="mb-8 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-teal/20 blur-[60px] rounded-full scale-150"></div>
        <img src="/logo.png" alt="ARGUS Logo" className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(20,184,166,0.5)]" />
      </div>

      <h1 className="text-4xl font-display font-black text-charcoal dark:text-canvas mb-2 tracking-wide">
        ARGUS
      </h1>
      <p className="text-slate font-mono text-xs tracking-[0.2em] uppercase mb-8">
        Advanced Real-time Guardian for Unified Security
      </p>

      <div className="glass-panel p-8 rounded-xl max-w-2xl text-center mb-10 text-sm text-slate leading-relaxed border-teal/10">
        ARGUS is a next-generation Network Intrusion Detection System (NIDS) designed for the modern 
        threat landscape. It leverages deep packet inspection, real-time threat intelligence feeds, 
        and adaptive STIX/TAXII integrations to proactively identify and neutralize malicious activity.
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-12">
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <Network className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Deep Inspection</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            State-of-the-art packet decoding engine parsing TCP/UDP payloads at line rate.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <Cpu className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Heuristic Rules</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            Dynamic rule engine compatible with Snort/Suricata syntax for instantaneous detection.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3">
          <Lock className="w-6 h-6 text-teal opacity-80" />
          <h3 className="font-semibold text-sm">Zero Trust</h3>
          <p className="text-[10px] text-slate-light leading-relaxed">
            Built from the ground up prioritizing encrypted telemetry and strict least-privilege.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 font-mono">
        <div className="text-[10px] text-slate-light tracking-widest uppercase">Version 1.0.0 (Core Engine Build)</div>
        <div className="text-[10px] text-slate-light tracking-widest uppercase mt-4">
          Designed & Developed by <span className="text-teal font-bold tracking-[0.25em]">ADARSH ARYA</span>
        </div>
      </div>
    </div>
  )
}
