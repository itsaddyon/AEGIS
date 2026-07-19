import React from "react";
import { Activity, Network, ShieldCheck } from "lucide-react";

export const About: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-canvas dark:bg-[#1E1F22] p-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-10">
        
        <div className="mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-teal/20 blur-[60px] rounded-full scale-150"></div>
          <img src="/logo.png" alt="VISTA Logo" className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(20,184,166,0.5)]" />
        </div>

        <h1 className="text-4xl font-display font-black text-[#3A4048] dark:text-[#EFEDE6] mb-2 tracking-wide font-mono">
          V.I.S.T.A.
        </h1>
        <p className="text-slate dark:text-slate-light font-mono text-xs tracking-[0.2em] uppercase mb-8 text-center">
          Visualized Information on Security & Traffic Analysis
        </p>

        <div className="glass-panel p-8 rounded-xl max-w-2xl text-center mb-10 text-sm text-slate dark:text-slate-light leading-relaxed border-teal/10 bg-white/5 dark:bg-[#141517]/50">
          VISTA is a professional-grade network traffic analyzer designed to provide unparalleled 
          visibility into live data streams. It leverages deep packet inspection to monitor active network 
          adapters, offering real-time bandwidth mapping, geospatial routing visualization, and DDoS mitigation analytics.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-12">
          <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3 bg-white/5 dark:bg-[#141517]/50 border border-border dark:border-white/5">
            <Activity className="w-6 h-6 text-teal opacity-80" />
            <h3 className="font-semibold text-sm text-[#3A4048] dark:text-[#EFEDE6]">Live Monitoring</h3>
            <p className="text-[10px] text-slate dark:text-slate-light leading-relaxed">
              Track TCP, UDP, and ICMP protocols in real-time across active network adapters.
            </p>
          </div>
          <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3 bg-white/5 dark:bg-[#141517]/50 border border-border dark:border-white/5">
            <Network className="w-6 h-6 text-teal opacity-80" />
            <h3 className="font-semibold text-sm text-[#3A4048] dark:text-[#EFEDE6]">Geospatial Routing</h3>
            <p className="text-[10px] text-slate dark:text-slate-light leading-relaxed">
              Identify source and destination IP addresses mapping to global geospatial regions.
            </p>
          </div>
          <div className="glass-panel p-5 rounded-lg flex flex-col items-center text-center gap-3 bg-white/5 dark:bg-[#141517]/50 border border-border dark:border-white/5">
            <ShieldCheck className="w-6 h-6 text-teal opacity-80" />
            <h3 className="font-semibold text-sm text-[#3A4048] dark:text-[#EFEDE6]">Absolute Integrity</h3>
            <p className="text-[10px] text-slate dark:text-slate-light leading-relaxed">
              Operates strictly on live network data to maintain absolute professional integrity.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 font-mono">
          <div className="text-[10px] text-slate-light tracking-widest uppercase">Version 0.1.0 (Alpha Build)</div>
          <div className="text-[10px] text-slate-light tracking-widest uppercase mt-4">
            Designed & Developed by <span className="text-teal font-bold tracking-[0.25em] drop-shadow-[0_0_6px_rgba(20,184,166,0.35)]">ADARSH ARYA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
