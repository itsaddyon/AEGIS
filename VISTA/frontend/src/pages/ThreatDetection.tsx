import React from "react";
import { ShieldAlert, ExternalLink, Activity, Search, ShieldCheck } from "lucide-react";

export const ThreatDetection: React.FC = () => {
  const handleLaunchArgus = () => {
    if ((window as any).pywebview) {
      (window as any).pywebview.api.launch_argus();
    } else {
      console.log("Cannot launch ARGUS: pywebview not available in this environment.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas dark:bg-[#1E1F22] p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="glass-panel p-12 rounded-xl bg-gradient-to-br from-teal/5 to-transparent border border-teal/10 dark:border-teal/20 flex flex-col items-center text-center relative overflow-hidden shadow-panel">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal to-transparent" />
          
          <div className="w-24 h-24 rounded-full bg-teal/10 flex items-center justify-center mb-6 ring-4 ring-teal/5">
            <ShieldAlert size={40} className="text-teal dark:text-[#52a39c]" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-[#3A4048] dark:text-[#EFEDE6] mb-4">
            ARGUS Threat Detection
          </h2>
          
          <p className="text-sm text-slate dark:text-slate-light leading-relaxed max-w-lg mb-10">
            Launch the Advanced Real-time Guardian for Unified Security (ARGUS). This powerful SOC console 
            provides live intrusion detection, rule-based alerts, and interactive case files.
          </p>

          <button
            onClick={handleLaunchArgus}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-white transition-all duration-200 bg-teal border border-transparent rounded-lg hover:bg-[#32635e] focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2 shadow-glow-teal"
          >
            <span>Launch ARGUS Subsystem</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-12 grid grid-cols-3 gap-4 w-full pt-8 border-t border-border dark:border-border-dark/50">
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-charcoal/30 border border-border/50 dark:border-white/5">
              <Activity size={20} className="text-teal" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-light uppercase">
                Live Monitor
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-charcoal/30 border border-border/50 dark:border-white/5">
              <Search size={20} className="text-teal" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-light uppercase">
                Case Files
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-charcoal/30 border border-border/50 dark:border-white/5">
              <ShieldCheck size={20} className="text-teal" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-light uppercase">
                IDS Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
