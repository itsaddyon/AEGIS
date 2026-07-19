import React, { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { OnboardingGuide } from "../components/common/OnboardingGuide";
import { LiveStats } from "../components/dashboard/LiveStats";
import { PacketList } from "../components/packets/PacketList";
import { PacketDetail } from "../components/packets/PacketDetail";
import { ProtocolDetailPanel } from "../components/common/ProtocolDetailPanel";
import { Info } from "lucide-react";

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

interface NetworkMonitorProps {
  interfaces: InterfaceInfo[];
  selectedInterface: string;
  setSelectedInterface: (name: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  isMock: boolean;
  hasPcap: boolean;
  packets: PacketData[];
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onClear: () => void;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  interfaces,
  selectedInterface,
  setSelectedInterface,
  isRunning,
  isPaused,
  isMock,
  hasPcap,
  packets,
  onStart,
  onStop,
  onPause,
  onResume,
  onClear
}) => {
  const [selectedPacket, setSelectedPacket] = useState<PacketData | null>(null);
  const [activeDocProtocol, setActiveDocProtocol] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // Compute onboarding step dynamically based on capture status and user selections
  const currentStep = (() => {
    if (!selectedInterface) return 1;
    if (!isRunning) return 2;
    if (packets.length < 3) return 3;
    if (!selectedPacket) return 4;
    return 5; // Onboarding complete
  })();

  const handleSelectPacket = (pkt: PacketData) => {
    setSelectedPacket(pkt);
  };

  const handleOpenProtocolInfo = (proto: string) => {
    setActiveDocProtocol(proto);
  };

  const handleCloseProtocolInfo = () => {
    setActiveDocProtocol(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-canvas dark:bg-[#1E1F22]">
      {/* Capture Control Header */}
      <Navbar
        interfaces={interfaces}
        selectedInterface={selectedInterface}
        onInterfaceChange={setSelectedInterface}
        isRunning={isRunning}
        isPaused={isPaused}
        isMock={isMock}
        onStart={onStart}
        onStop={onStop}
        onPause={onPause}
        onResume={onResume}
        onClear={() => {
          onClear();
          setSelectedPacket(null);
        }}
        packetCount={packets.length}
      />

      {/* Main Page Layout Container */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Real-time vs Demo Mode System Status Card */}
        {!hasPcap ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-md text-amber-600 dark:text-amber-400 shrink-0">
                <Info size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">VISTA running in Demo Mode (Simulated Traffic)</h4>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5 font-sans">
                  Real-time network sniffing requires <strong className="font-semibold">Npcap</strong> (the Windows packet capture library) to be installed. Since Npcap was not detected on your system, VISTA is running in Demo Mode with simulated traffic.
                </p>
              </div>
            </div>
            <a
              href="https://npcap.com/#download"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow transition-colors shrink-0 inline-block text-center w-full sm:w-auto"
            >
              Download Npcap
            </a>
          </div>
        ) : isRunning ? (
          isMock ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-md text-amber-600 dark:text-amber-400 shrink-0">
                <Info size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight font-sans">VISTA running in Demo Mode (Simulation)</h4>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5 font-sans">
                  The VISTA packet capture was started in simulation mode. To capture real network traffic, make sure Npcap is installed and run VISTA as Administrator.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 shrink-0">
                <Info size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight font-sans">Live Real-Time Sniffing Active</h4>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5 font-sans">
                  VISTA is actively sniffing real packets on interface <strong className="font-semibold">{selectedInterface}</strong>. To test: open your browser and visit any website (e.g. browse <a href="http://example.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-emerald-600 dark:hover:text-emerald-400">example.com</a> or query DNS) to see your real-time traffic captured instantly!
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="p-4 bg-teal-500/10 border border-teal-500/30 dark:border-teal-500/20 text-teal-900 dark:text-[#6ec4bc] rounded-lg flex items-start gap-3">
            <div className="p-2 bg-teal-500/20 rounded-md text-teal-600 dark:text-[#52a39c] shrink-0">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight font-sans">Real-Time Sniffer Ready</h4>
              <p className="text-xs opacity-90 leading-relaxed mt-0.5 font-sans">
                Select your network card (usually <strong className="font-semibold">Wi-Fi</strong> or <strong className="font-semibold">Ethernet</strong>) from the <strong className="font-mono text-[11px] bg-canvas/50 dark:bg-graphite/40 px-1 py-0.5 rounded border border-border/20">IFACE</strong> dropdown and click <strong className="text-teal dark:text-[#6ec4bc]">Start Capture</strong> to begin tracking real network data.
              </p>
            </div>
          </div>
        )}

        {/* Onboarding Guide Card */}
        {showGuide && currentStep <= 4 && (
          <OnboardingGuide
            currentStep={currentStep}
            onDismiss={() => setShowGuide(false)}
          />
        )}

        {/* Live Status Graphing Metrics */}
        <LiveStats packets={packets} isRunning={isRunning} />

        {/* Live Sniffer & Deep Inspector Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Packet Grid (2/3 width) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Captured Packet Stream</span>
              <span className="w-2 h-2 rounded-full bg-teal dark:bg-[#52a39c] animate-pulse"></span>
            </h3>
            <PacketList
              packets={packets}
              selectedPacket={selectedPacket}
              onSelectPacket={handleSelectPacket}
              onOpenProtocolInfo={handleOpenProtocolInfo}
            />
          </div>

          {/* Packet Inspector (1/3 width) */}
          <div>
            <h3 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Deep Inspector</span>
              <Info size={12} className="text-slate-light" />
            </h3>
            <div className="h-[500px]">
              <PacketDetail packet={selectedPacket} />
            </div>
          </div>
        </div>
      </div>

      {/* Educational Guide Drawer */}
      <ProtocolDetailPanel
        protocol={activeDocProtocol}
        onClose={handleCloseProtocolInfo}
      />
    </div>
  );
};
