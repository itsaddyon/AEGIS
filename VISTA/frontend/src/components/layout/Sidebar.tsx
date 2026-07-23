import React, { useEffect, useState } from "react";
import { Activity, BookOpen, ShieldAlert, Sun, Moon } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  isOpen,
  onClose
}) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    fetch("/api/user/identity")
      .then((res) => res.json())
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, []);
  // VISTA's own core features.
  const menuItems = [
    {
      id: "monitor",
      label: "Network Monitor",
      icon: Activity,
      tag: "Active",
      tagColor: "bg-teal/15 text-teal dark:text-[#52a39c]"
    },
  ];

  // Other apps in the suite, launched as separate standalone processes.
  const suiteItems = [
    {
      id: "learning",
      label: "Learning Hub",
      icon: BookOpen,
      tag: "Active",
      tagColor: "bg-teal/15 text-teal dark:text-[#52a39c]"
    },
    {
      id: "threat",
      label: "ARGUS Console",
      icon: ShieldAlert,
      tag: "Active",
      tagColor: "bg-teal/15 text-teal dark:text-[#52a39c]"
    }
  ];

  const renderMenuItem = (item: (typeof menuItems)[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          onClose();
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-all duration-200 cursor-pointer group ${
          isActive
            ? "bg-teal/5 text-teal border-l-4 border-teal dark:border-[#52a39c] dark:bg-[#3F7D77]/5 dark:text-[#52a39c] font-semibold"
            : "text-slate dark:text-slate-light hover:bg-surface-muted dark:hover:bg-graphite hover:text-[#3A4048] dark:hover:text-[#EFEDE6]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            size={16}
            className={`${
              isActive ? "text-teal dark:text-[#52a39c]" : "text-slate-light group-hover:text-teal"
            } transition-colors`}
          />
          <span className="text-xs font-semibold">{item.label}</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold leading-none ${item.tagColor}`}>
          {item.tag}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/35 backdrop-blur-[2px] z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed md:relative top-0 left-0 h-full w-64 bg-white dark:bg-charcoal border-r border-border dark:border-border-dark flex flex-col shrink-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Upper Logo / Metadata */}
        <div className="p-6 border-b border-border dark:border-border-dark bg-canvas dark:bg-[#1E1F22]">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.png" alt="VISTA Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
            <span className="font-extrabold text-[#3A4048] dark:text-[#EFEDE6] text-lg tracking-wider font-mono">
              V.I.S.T.A.
            </span>
          </div>
          <p className="text-[10px] text-slate-light leading-relaxed font-mono">
            Visualized Information on Security & Traffic Analysis
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => renderMenuItem(item))}

          <div className="pt-4 mt-2 border-t border-border dark:border-border-dark">
            <div className="px-3 pb-2 text-[9px] font-mono uppercase tracking-widest text-slate-light">
              AEGIS Ecosystem
            </div>
            <div className="space-y-2">
              {suiteItems.map((item) => renderMenuItem(item))}
            </div>
          </div>
          
          <div className="pt-4 mt-2 border-t border-border dark:border-border-dark">
            <button
              onClick={() => {
                setActiveTab("about");
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-all duration-200 cursor-pointer group ${
                activeTab === "about"
                  ? "bg-teal/5 text-teal border-l-4 border-teal dark:border-[#52a39c] dark:bg-[#3F7D77]/5 dark:text-[#52a39c] font-semibold"
                  : "text-slate dark:text-slate-light hover:bg-surface-muted dark:hover:bg-graphite hover:text-[#3A4048] dark:hover:text-[#EFEDE6]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold">About VISTA</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Theme Toggle & Bottom Footer */}
        <div className="p-4 border-t border-border dark:border-border-dark bg-canvas dark:bg-[#1E1F22] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-light">THEME:</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded border border-border dark:border-border-dark bg-white dark:bg-charcoal hover:bg-surface-muted dark:hover:bg-graphite text-slate dark:text-slate-light transition-colors cursor-pointer"
                title="Toggle color theme"
              >
                {isDark ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
              </button>
            </div>
            <span className="text-[9px] font-mono text-slate-light">v0.1.0 (Alpha)</span>
          </div>
          {username && (
            <div className="text-[11px] font-mono text-teal dark:text-[#52a39c] flex items-center gap-1.5 pt-1 border-t border-border/40 dark:border-border-dark/40">
              <span className="w-1.5 h-1.5 rounded-full bg-teal dark:bg-[#52a39c]"></span>
              <span>Hello, <strong className="font-semibold">{username}</strong></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
