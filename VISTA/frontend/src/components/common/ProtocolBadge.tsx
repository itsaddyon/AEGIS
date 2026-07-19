import React from "react";

interface ProtocolBadgeProps {
  protocol: string;
  onClick?: (protocol: string) => void;
}

export const ProtocolBadge: React.FC<ProtocolBadgeProps> = ({ protocol, onClick }) => {
  const normProto = protocol.toUpperCase();

  // Get color themes based on security and protocol characteristics
  const getTheme = () => {
    switch (normProto) {
      case "HTTPS":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200/60 dark:border-emerald-800/40",
          dot: "bg-emerald-500",
        };
      case "HTTP":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200/60 dark:border-amber-800/30",
          dot: "bg-amber-500",
        };
      case "ARP":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/20",
          text: "text-rose-700 dark:text-rose-400",
          border: "border-rose-200/60 dark:border-rose-800/30",
          dot: "bg-rose-500",
        };
      case "DNS":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/20",
          text: "text-indigo-700 dark:text-indigo-400",
          border: "border-indigo-200/60 dark:border-indigo-800/30",
          dot: "bg-indigo-500",
        };
      case "TCP":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-200/60 dark:border-blue-800/30",
          dot: "bg-blue-500",
        };
      case "UDP":
        return {
          bg: "bg-cyan-50 dark:bg-cyan-950/20",
          text: "text-cyan-700 dark:text-cyan-400",
          border: "border-cyan-200/60 dark:border-cyan-800/30",
          dot: "bg-cyan-500",
        };
      case "ICMP":
        return {
          bg: "bg-violet-50 dark:bg-violet-950/20",
          text: "text-violet-700 dark:text-violet-400",
          border: "border-violet-200/60 dark:border-violet-800/30",
          dot: "bg-violet-500",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800/30",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-200/60 dark:border-slate-700/30",
          dot: "bg-slate-400",
        };
    }
  };

  const theme = getTheme();

  return (
    <button
      onClick={() => onClick && onClick(normProto)}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold border ${theme.bg} ${theme.text} ${theme.border} transition-all duration-200 ${
        onClick ? "hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow" : ""
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
      {normProto}
    </button>
  );
};
