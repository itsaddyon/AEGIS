import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Sidebar } from "./components/layout/Sidebar";
import { NetworkMonitor } from "./pages/NetworkMonitor";
import { LearningHub } from "./pages/LearningHub";
import { ThreatDetection } from "./pages/ThreatDetection";
import { About } from "./pages/About";
import { SplashPreloader } from "./components/common/SplashPreloader";
import { ThreatAlertBanner } from "./components/ThreatAlertBanner";
import { Menu } from "lucide-react";

interface InterfaceInfo {
  name: string;
  address: string;
}

interface PacketData {
  id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  protocol: string;
  src_port: number | null;
  dst_port: number | null;
  length: number;
  status: string;
  summary: string;
  headers?: Record<string, Record<string, string>>;
  payload_hex?: string;
  payload_ascii?: string;
  src_dns?: string;
  dst_dns?: string;
  src_label?: string;
  dst_label?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active interface state
  const [interfaces, setInterfaces] = useState<InterfaceInfo[]>([]);
  const [selectedInterface, setSelectedInterface] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [hasPcap, setHasPcap] = useState(true);
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  const socketRef = useRef<Socket | null>(null);

  // Theme configuration
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const dark = savedTheme === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Initial metadata fetch
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const ifaceRes = await fetch("/api/network/interfaces");
        const ifaceData = await ifaceRes.json();
        setInterfaces(ifaceData.interfaces || []);
        if (ifaceData.has_pcap !== undefined) {
          setHasPcap(ifaceData.has_pcap);
        }
      } catch (err) {
        console.error("Error fetching network interfaces:", err);
      }

      try {
        const packetsRes = await fetch("/api/packets");
        const packetsData = await packetsRes.json();
        setPackets(packetsData.packets || []);
      } catch (err) {
        console.error("Error fetching current packet buffer:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Socket connection setup
  useEffect(() => {
    const backendHost = window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin;
    const socket = io(backendHost, {
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to VISTA socket gateway");
    });

    socket.on("capture_status", (status: { is_running: boolean; is_paused: boolean; interface: string | null; is_mock?: boolean; has_pcap?: boolean }) => {
      setIsRunning(status.is_running);
      setIsPaused(status.is_paused);
      setSelectedInterface(status.interface || "");
      setIsMock(!!status.is_mock);
      if (status.has_pcap !== undefined) {
        setHasPcap(status.has_pcap);
      }
    });

    socket.on("packets_captured", (batch: PacketData[]) => {
      if (!batch || batch.length === 0) return;
      setPackets((prev) => {
        const next = [...prev, ...batch];
        if (next.length > 1000) {
          return next.slice(next.length - 1000);
        }
        return next;
      });
    });

    socket.on("capture_error", (err: { message: string }) => {
      alert(`VISTA Capture Error: ${err.message}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from VISTA socket gateway");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action event handlers
  const handleStartCapture = () => {
    if (socketRef.current) {
      socketRef.current.emit("start_capture", { interface: selectedInterface });
    }
  };

  const handleStopCapture = () => {
    if (socketRef.current) {
      socketRef.current.emit("stop_capture");
    }
  };

  const handlePauseCapture = () => {
    if (socketRef.current) {
      socketRef.current.emit("pause_capture");
    }
  };

  const handleResumeCapture = () => {
    if (socketRef.current) {
      socketRef.current.emit("resume_capture");
    }
  };

  const handleClearPackets = async () => {
    try {
      await fetch("/api/packets/clear", { method: "POST" });
      setPackets([]);
    } catch (err) {
      console.error("Failed to clear packet logs:", err);
    }
  };

  if (showSplash) {
    return <SplashPreloader onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas dark:bg-[#1E1F22]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ThreatAlertBanner />
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-charcoal border-b border-border dark:border-border-dark shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded border border-border dark:border-border-dark text-slate dark:text-slate-light hover:bg-surface-muted dark:hover:bg-graphite cursor-pointer"
            >
              <Menu size={16} />
            </button>
            <span className="font-bold text-xs text-[#3A4048] dark:text-[#EFEDE6] font-mono tracking-wider">
              {activeTab === "monitor"
                ? "VISTA // NETWORK MONITOR"
                : activeTab === "learning"
                ? "VISTA // LEARNING HUB"
                : "VISTA // THREAT DETECTION"}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-light font-bold">v0.1.0</span>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "monitor" && (
            <NetworkMonitor
              interfaces={interfaces}
              selectedInterface={selectedInterface}
              setSelectedInterface={setSelectedInterface}
              isRunning={isRunning}
              isPaused={isPaused}
              isMock={isMock}
              hasPcap={hasPcap}
              packets={packets}
              onStart={handleStartCapture}
              onStop={handleStopCapture}
              onPause={handlePauseCapture}
              onResume={handleResumeCapture}
              onClear={handleClearPackets}
            />
          )}
          {activeTab === "learning" && <LearningHub />}
          {activeTab === "threat" && <ThreatDetection />}
          {activeTab === "about" && <About />}
        </div>
      </main>
    </div>
  );
}
