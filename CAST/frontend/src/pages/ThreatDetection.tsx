import React from "react";
import { ShieldAlert, AlertTriangle, Eye, Settings } from "lucide-react";

export const ThreatDetection: React.FC = () => {
  const mockAlerts = [
    {
      id: "al-101",
      timestamp: "Just Now",
      severity: "high",
      type: "ARP Poisoning Attempt",
      source: "192.168.1.99",
      target: "192.168.1.45",
      summary: "Sender IP claims to be gateway address but provides a different MAC address (00:0c:29:ab:12:ef)."
    },
    {
      id: "al-102",
      timestamp: "2 mins ago",
      severity: "medium",
      type: "TCP Port Sweep / Scan",
      source: "192.168.1.201",
      target: "192.168.1.45",
      summary: "Rapid connection attempts detected on ports 21, 22, 23, 80, 443, and 3389 within 2 seconds."
    },
    {
      id: "al-103",
      timestamp: "5 mins ago",
      severity: "low",
      type: "Plaintext Credentials Sent",
      source: "192.168.1.45",
      target: "93.184.216.34",
      summary: "An HTTP POST request on port 80 contains raw fields 'user' and 'passwd' in clear text payload."
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-canvas dark:bg-[#1E1F22] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="glass-panel p-8 rounded-lg bg-gradient-to-r from-rose-500/10 via-transparent to-teal/10 border border-border dark:border-border-dark flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full shrink-0">
            <ShieldAlert size={48} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 uppercase">
                Intrusion Detection System (IDS)
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-teal/15 text-teal dark:text-[#52a39c] uppercase">
                FUTURE MODULE
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#3A4048] dark:text-[#EFEDE6]">
              VISTA Intrusion Detection System
            </h2>
            <p className="text-sm text-slate dark:text-slate-light leading-relaxed max-w-2xl">
              An IDS operates like a home security system for network traffic. It inspects header envelopes and payloads in real-time, matching them against known attack blueprints (signatures) and alerting you of suspicious activity.
            </p>
          </div>
        </div>

        {/* Security Alert Feed Simulation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-light uppercase tracking-wider flex items-center gap-2">
              <Eye size={12} /> Simulated Threat Alert Feed
            </h3>
            <span className="text-[9px] font-mono text-slate-light">SIMULATION ONLY</span>
          </div>

          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal border-l-4 border-l-rose-500 flex gap-4 transition-all duration-200 hover:translate-x-1"
              >
                <div className="mt-1">
                  <AlertTriangle
                    className={
                      alert.severity === "high"
                        ? "text-rose-500 animate-pulse"
                        : alert.severity === "medium"
                        ? "text-amber-500"
                        : "text-blue-500"
                    }
                    size={18}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6]">
                        {alert.type}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                          alert.severity === "high"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                            : alert.severity === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {alert.severity} severity
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-light font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate dark:text-slate-light leading-relaxed">
                    {alert.summary}
                  </p>
                  <div className="text-[10px] font-mono text-slate-light flex gap-3">
                    <span>SRC: {alert.source}</span>
                    <span>DST: {alert.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Toggles / Signature Config (Placeholder) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-light uppercase tracking-wider flex items-center gap-2">
            <Settings size={12} /> Threat Signature Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule 1 */}
            <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center justify-between border border-border dark:border-border-dark opacity-75">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6]">
                  Flag ARP Cache Spoofing
                </h4>
                <p className="text-[11px] text-slate dark:text-slate-light leading-snug">
                  Inspects MAC/IP mappings to verify router identity matches hardware cache.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-light">COMING SOON</span>
                <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-graphite relative cursor-not-allowed">
                  <span className="absolute left-1 top-0.5 w-3 h-3 rounded-full bg-slate-light"></span>
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center justify-between border border-border dark:border-border-dark opacity-75">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6]">
                  Rate-Limit Port Scans
                </h4>
                <p className="text-[11px] text-slate dark:text-slate-light leading-snug">
                  Triggers warning if a single IP attempts connections on multiple ports rapidly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-light">COMING SOON</span>
                <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-graphite relative cursor-not-allowed">
                  <span className="absolute left-1 top-0.5 w-3 h-3 rounded-full bg-slate-light"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
