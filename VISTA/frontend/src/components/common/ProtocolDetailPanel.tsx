import React from "react";
import { X, ShieldCheck, ShieldAlert, ShieldX, Info, BookOpen } from "lucide-react";
import { protocolDocs } from "../../data/protocol_docs";

interface ProtocolDetailPanelProps {
  protocol: string | null;
  onClose: () => void;
}

export const ProtocolDetailPanel: React.FC<ProtocolDetailPanelProps> = ({ protocol, onClose }) => {
  if (!protocol) return null;

  const doc = protocolDocs[protocol.toUpperCase()];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-[3px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-charcoal border-l border-border dark:border-border-dark shadow-2xl z-50 overflow-y-auto transition-transform duration-300 animate-slide-in flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between bg-canvas dark:bg-[#1E1F22]">
          <div className="flex items-center gap-2">
            <BookOpen className="text-teal dark:text-[#52a39c]" size={20} />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-teal dark:text-[#52a39c] leading-none">
                {protocol.toUpperCase()}
              </h2>
              <span className="text-[10px] text-slate-light font-mono font-medium">PROTOCOL GUIDE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate hover:bg-surface-muted dark:hover:bg-graphite transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {doc ? (
          <div className="p-6 space-y-6 flex-1">
            {/* Full Name & Brief */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider mb-1">Official Name</h3>
              <p className="text-base font-semibold text-[#3A4048] dark:text-[#EFEDE6] mb-2">{doc.fullName}</p>
              <p className="text-sm leading-relaxed text-slate dark:text-slate-light">{doc.description}</p>
            </div>

            {/* Safety Assessment */}
            <div className="p-4 rounded border dark:border-none bg-canvas dark:bg-graphite flex gap-3">
              <div className="mt-0.5">
                {doc.isSafe === "safe" && <ShieldCheck className="text-emerald-500" size={20} />}
                {doc.isSafe === "warning" && <ShieldAlert className="text-amber-500" size={20} />}
                {doc.isSafe === "danger" && <ShieldX className="text-rose-500" size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A4048] dark:text-[#EFEDE6]">
                    Security Status
                  </h4>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      doc.isSafe === "safe"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : doc.isSafe === "warning"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                  >
                    {doc.isSafe}
                  </span>
                </div>
                <p className="text-xs text-slate dark:text-slate-light leading-relaxed">{doc.safetyExplanation}</p>
              </div>
            </div>

            {/* Real-World Analogy */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Real-World Analogy</h3>
              <div className="p-4 rounded-md border-l-4 border-teal bg-teal/5 dark:bg-[#3F7D77]/5 text-sm italic leading-relaxed text-[#3A4048] dark:text-[#EFEDE6]">
                &ldquo;{doc.analogy}&rdquo;
              </div>
            </div>

            {/* Why it exists */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Why It Exists</h3>
              <p className="text-xs text-slate dark:text-slate-light leading-relaxed">{doc.whyExists}</p>
            </div>

            {/* Diagram */}
            {doc.diagram && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider">How It Works (Flow)</h3>
                <pre className="p-3 bg-graphite dark:bg-black rounded font-mono text-[10.5px] leading-tight text-[#EFEDE6] overflow-x-auto border border-border-dark">
                  {doc.diagram.trim()}
                </pre>
              </div>
            )}

            {/* Common Uses */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Commonly Used For</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {doc.commonUses.map((use, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs bg-canvas dark:bg-graphite p-2 rounded border border-border/40 dark:border-border-dark/40 text-slate dark:text-slate-light"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal dark:bg-[#52a39c]"></span>
                    {use}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interesting Facts */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Did You Know?</h3>
              <div className="space-y-2">
                {doc.facts.map((fact, index) => (
                  <div key={index} className="flex gap-2 text-xs text-slate dark:text-slate-light leading-relaxed">
                    <Info size={14} className="text-teal dark:text-[#52a39c] shrink-0 mt-0.5" />
                    <p>{fact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-light text-xs">
            No documentation available for the protocol &quot;{protocol}&quot;. It might be a custom or lesser-known
            protocol.
          </div>
        )}
      </div>
    </>
  );
};
