import React, { useState } from "react";
import { GraduationCap, ArrowUpRight, ShieldAlert, Target, ShieldCheck, Cpu } from "lucide-react";

export const LearningHub: React.FC = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLaunchCAST = async () => {
    setIsLaunching(true);
    setErrorMsg("");
    setStatusMsg("INITIATING SECURE CAST TRANSIT BRIDGE...");

    // Delay 1.5s for professional feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch("/api/learning/launch-cast", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg("ACCESS AUTHORIZED. OPENING CAST...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLaunching(false);
      } else {
        setErrorMsg(data.error || "Failed to locate CAST.exe or main.py.");
        setIsLaunching(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error connecting to VISTA server.");
      setIsLaunching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas dark:bg-[#1E1F22] p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#EFEDE6] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#52a39c] dark:to-[#EFEDE6]">
            LEARNING HUB
          </h1>
          <p className="mt-1 text-xs font-mono text-slate dark:text-slate-light tracking-wide">
            Interactive cybersecurity awareness simulations, powered by the CAST training engine.
          </p>
        </div>

        {/* CAST Trainer Launch Module */}
        <div className="glass-panel p-6 rounded-lg bg-teal/5 dark:bg-[#3F7D77]/10 border border-teal/20 dark:border-[#52a39c]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[10px] font-mono font-bold bg-teal/10 text-teal dark:text-[#52a39c] rounded-bl uppercase tracking-wider">
            Unlocked
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal/10 dark:bg-teal/20 text-teal dark:text-[#52a39c]">
                  <GraduationCap size={22} />
                </div>
                <span className="text-[9px] font-mono font-bold text-teal dark:text-[#52a39c] uppercase tracking-wider block">
                  PHISHING & CYBER SAFETY TRAINING
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#3A4048] dark:text-[#EFEDE6]">
                C.A.S.T. — Cyber Awareness Simulation Trainer
              </h3>
              <p className="text-xs text-slate dark:text-slate-light leading-relaxed">
                Run interactive phishing simulations, email filters, password strength auditing, USB attack mitigations, and QR scanner analysis. CAST opens as its own standalone application alongside VISTA.
              </p>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 my-4 text-left w-full flex flex-col gap-1">
            <span className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Ecosystem Setup Required
            </span>
            <span className="text-slate-light text-[11px] leading-relaxed">
              This module uses Optional Ecosystem Interoperability. To launch it, you must have cloned the full AEGIS repository so all projects sit adjacently. See the <a href="https://github.com/itsaddyon/AEGIS" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Setup Guide</a>.
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleLaunchCAST}
              className="px-5 py-2.5 bg-teal hover:bg-[#2d5d58] dark:bg-[#52a39c] dark:hover:bg-[#3d7a74] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(63,125,119,0.25)] cursor-pointer whitespace-nowrap self-end md:self-auto"
            >
              Launch CAST Module
              <ArrowUpRight size={14} />
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 dark:text-red-400 text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Preview strip of what CAST offers */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-lg border border-border dark:border-border-dark bg-white/50 dark:bg-charcoal/50">
            <Target size={18} className="text-teal dark:text-[#52a39c]" />
            <div className="mt-2 text-sm font-semibold text-[#3A4048] dark:text-[#EFEDE6]">Phishing Simulators</div>
            <div className="mt-1 text-xs text-slate dark:text-slate-light">Spot malicious emails, fake domains, and spear-phishing attacks.</div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-border dark:border-border-dark bg-white/50 dark:bg-charcoal/50">
            <ShieldCheck size={18} className="text-teal dark:text-[#52a39c]" />
            <div className="mt-2 text-sm font-semibold text-[#3A4048] dark:text-[#EFEDE6]">Password Auditing</div>
            <div className="mt-1 text-xs text-slate dark:text-slate-light">Learn entropy concepts and cryptographic hashing principles.</div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-border dark:border-border-dark bg-white/50 dark:bg-charcoal/50">
            <Cpu size={18} className="text-teal dark:text-[#52a39c]" />
            <div className="mt-2 text-sm font-semibold text-[#3A4048] dark:text-[#EFEDE6]">Device Security</div>
            <div className="mt-1 text-xs text-slate dark:text-slate-light">Mitigate physical USB drops and social engineering tactics.</div>
          </div>
        </div>
      </div>

      {/* Transit Transition Dialog Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm bg-white dark:bg-[#141517] border border-border dark:border-white/10 p-6 rounded-lg text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal/20 via-teal to-teal/20 animate-pulse" />
            
            <h3 className="font-mono text-xs font-bold text-teal dark:text-[#52a39c] tracking-widest uppercase mb-4">
              {statusMsg}
            </h3>
            <p className="text-[10px] text-slate dark:text-slate-light font-mono leading-relaxed mb-4">
              Switching execution frame into Cyber Awareness Sandbox...
            </p>

            <div className="h-1 w-full bg-slate-100 dark:bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-teal dark:bg-[#52a39c] animate-pulse" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
