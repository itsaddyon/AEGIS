import React from "react";
import { Play, Square, Pause, RotateCcw, ShieldAlert, Cpu, Network } from "lucide-react";

interface InterfaceInfo {
  name: string;
  address: string;
}

interface NavbarProps {
  interfaces: InterfaceInfo[];
  selectedInterface: string;
  onInterfaceChange: (name: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  isMock: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onClear: () => void;
  packetCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  interfaces,
  selectedInterface,
  onInterfaceChange,
  isRunning,
  isPaused,
  isMock,
  onStart,
  onStop,
  onPause,
  onResume,
  onClear,
  packetCount
}) => {
  return (
    <header className="glass-panel sticky top-0 z-30 px-6 py-4 border-b border-border dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-charcoal/80">
      {/* VISTA Title - hidden on mobile since the mobile top bar renders it */}
      <div className="hidden md:flex items-center gap-3">
        <div className="p-2 bg-teal/10 rounded-md">
          <Network className="text-teal dark:text-[#52a39c]" size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-teal dark:text-[#52a39c]">
              VISTA
            </h1>
            {isMock && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 animate-pulse">
                <ShieldAlert size={10} />
                DEMO MODE
              </span>
            )}
            {!isMock && isRunning && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                <Cpu size={10} />
                LIVE SNIFF
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-light font-mono font-medium tracking-wide block uppercase leading-none mt-0.5">
            Network Security & Traffic Analyzer
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Interface Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-light font-mono font-medium hidden sm:inline">IFACE:</span>
          <select
            value={selectedInterface}
            onChange={(e) => onInterfaceChange(e.target.value)}
            disabled={isRunning}
            className="px-3 py-1.5 rounded border border-border dark:border-border-dark bg-white dark:bg-graphite text-xs font-mono focus:outline-none focus:border-teal dark:focus:border-[#52a39c] disabled:opacity-50 text-[#3A4048] dark:text-[#EFEDE6]"
          >
            <option value="">-- Autodetect Interface --</option>
            {interfaces.map((iface) => (
              <option key={iface.name} value={iface.name}>
                {iface.name} ({iface.address})
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 border-l border-border dark:border-border-dark pl-3">
          {isRunning ? (
            <>
              {/* Pause/Resume button */}
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-teal hover:bg-[#2d5d58] dark:bg-[#52a39c] dark:hover:bg-[#3d7a74] text-white transition-colors cursor-pointer shadow-sm"
                >
                  <Play size={12} fill="white" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-sm"
                >
                  <Pause size={12} fill="white" />
                  Pause
                </button>
              )}

              {/* Stop button */}
              <button
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                <Square size={12} fill="white" />
                Stop
              </button>
            </>
          ) : (
            /* Start button */
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold bg-teal hover:bg-[#2d5d58] dark:bg-[#52a39c] dark:hover:bg-[#3d7a74] text-white transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Play size={12} fill="white" />
              Start Capture
            </button>
          )}

          {/* Clear button */}
          <button
            onClick={onClear}
            disabled={packetCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border border-border dark:border-border-dark hover:bg-surface-muted dark:hover:bg-graphite disabled:opacity-40 text-slate dark:text-slate-light transition-colors cursor-pointer"
            title="Clear current capture logs"
          >
            <RotateCcw size={12} />
            Clear
          </button>
        </div>
      </div>
    </header>
  );
};
