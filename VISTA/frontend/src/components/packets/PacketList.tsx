import React, { useState, useMemo } from "react";
import { ProtocolBadge } from "../common/ProtocolBadge";
import { Search, Filter, ShieldAlert } from "lucide-react";

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
  src_dns?: string;
  dst_dns?: string;
  src_label?: string;
  dst_label?: string;
}

interface PacketListProps {
  packets: PacketData[];
  selectedPacket: PacketData | null;
  onSelectPacket: (packet: PacketData) => void;
  onOpenProtocolInfo: (protocol: string) => void;
}

export const PacketList: React.FC<PacketListProps> = ({
  packets,
  selectedPacket,
  onSelectPacket,
  onOpenProtocolInfo
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");

  // Unique protocols list for filter options
  const filterTabs = ["ALL", "TCP", "UDP", "DNS", "ARP", "ICMP", "HTTP", "HTTPS"];

  // Filtered Packets list
  const filteredPackets = useMemo(() => {
    return packets
      .filter((pkt) => {
        // Protocol filter
        if (protocolFilter !== "ALL") {
          return pkt.protocol.toUpperCase() === protocolFilter;
        }
        return true;
      })
      .filter((pkt) => {
        // Text search
        const query = searchTerm.toLowerCase();
        return (
          pkt.src_ip.toLowerCase().includes(query) ||
          pkt.dst_ip.toLowerCase().includes(query) ||
          pkt.protocol.toLowerCase().includes(query) ||
          pkt.summary.toLowerCase().includes(query)
        );
      })
      .reverse(); // Newest first in UI
  }, [packets, protocolFilter, searchTerm]);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 } as any);
    } catch (e) {
      return isoString.substring(11, 23);
    }
  };

  return (
    <div className="glass-panel rounded-lg bg-white dark:bg-charcoal flex flex-col h-[500px]">
      {/* Filtering and Search Header */}
      <div className="p-4 border-b border-border dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 bg-canvas/30 dark:bg-graphite/20">
        {/* Protocol tabs */}
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-light mr-1.5 flex items-center gap-1 font-mono uppercase">
            <Filter size={10} /> Filter:
          </span>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setProtocolFilter(tab)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                protocolFilter === tab
                  ? "bg-teal text-white dark:bg-[#52a39c]"
                  : "bg-canvas dark:bg-graphite hover:bg-surface-muted dark:hover:bg-slate-dark text-slate dark:text-slate-light border border-border/40 dark:border-border-dark/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Text Search Box */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search IP, protocol, summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-border dark:border-border-dark bg-white dark:bg-graphite text-xs focus:outline-none focus:border-teal dark:focus:border-[#52a39c] text-[#3A4048] dark:text-[#EFEDE6]"
          />
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-light" />
        </div>
      </div>

      {/* Packets Grid */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="sticky top-0 bg-canvas dark:bg-[#1E1F22] border-b border-border dark:border-border-dark text-[10px] font-bold uppercase tracking-wider text-slate-light font-mono z-10">
              <th className="py-2.5 px-4 w-28 hidden sm:table-cell">Timestamp</th>
              <th className="py-2.5 px-4 w-40">Source IP</th>
              <th className="py-2.5 px-4 w-40">Destination IP</th>
              <th className="py-2.5 px-4 w-24">Protocol</th>
              <th className="py-2.5 px-4 w-20 hidden md:table-cell">Size</th>
              <th className="py-2.5 px-4">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackets.length > 0 ? (
              filteredPackets.map((pkt) => {
                const isSelected = selectedPacket?.id === pkt.id;
                
                return (
                  <tr
                    key={pkt.id}
                    onClick={() => onSelectPacket(pkt)}
                    className={`text-xs border-b border-border/30 dark:border-border-dark/20 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-teal/5 dark:bg-[#3F7D77]/5 border-l-4 border-l-teal dark:border-l-[#52a39c]"
                        : "hover:bg-canvas/50 dark:hover:bg-graphite/40 text-[#3A4048] dark:text-[#EFEDE6]"
                    }`}
                  >
                    <td className="py-2 px-4 font-mono text-[11px] text-slate dark:text-slate-light hidden sm:table-cell">
                      {formatTime(pkt.timestamp)}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-[11px] truncate">
                          {pkt.src_ip}
                          {pkt.src_port && <span className="text-[10px] text-slate-light">:{pkt.src_port}</span>}
                        </span>
                        {(pkt.src_dns || pkt.src_label) && (
                          <span className="text-[9px] text-[#52a39c] dark:text-[#6ec4bc] font-medium truncate max-w-[150px] leading-tight" title={pkt.src_dns && pkt.src_label ? `${pkt.src_dns} (${pkt.src_label})` : (pkt.src_dns || pkt.src_label)}>
                            {pkt.src_dns ? pkt.src_dns : pkt.src_label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-[11px] truncate">
                          {pkt.dst_ip}
                          {pkt.dst_port && <span className="text-[10px] text-slate-light">:{pkt.dst_port}</span>}
                        </span>
                        {(pkt.dst_dns || pkt.dst_label) && (
                          <span className="text-[9px] text-[#52a39c] dark:text-[#6ec4bc] font-medium truncate max-w-[150px] leading-tight" title={pkt.dst_dns && pkt.dst_label ? `${pkt.dst_dns} (${pkt.dst_label})` : (pkt.dst_dns || pkt.dst_label)}>
                            {pkt.dst_dns ? pkt.dst_dns : pkt.dst_label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <ProtocolBadge protocol={pkt.protocol} onClick={onOpenProtocolInfo} />
                    </td>
                    <td className="py-2 px-4 font-mono text-[11px] text-slate dark:text-slate-light hidden md:table-cell">
                      {pkt.length} B
                    </td>
                    <td className="py-2 px-4 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-sm lg:max-w-lg xl:max-w-xl">
                      {pkt.summary}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-light italic bg-white dark:bg-charcoal">
                  {packets.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert className="text-slate-light animate-pulse" size={24} />
                      <span>Traffic buffer is empty. Start the sniffer to stream packets.</span>
                    </div>
                  ) : (
                    <span>No packets match search criteria or protocol filters.</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer statistics */}
      <div className="p-3 border-t border-border dark:border-border-dark bg-canvas/30 dark:bg-graphite/20 flex items-center justify-between text-[10px] font-mono text-slate-light">
        <span>Showing {filteredPackets.length} of {packets.length} packets</span>
        <span>Click any protocol badge to read its educational guide</span>
      </div>
    </div>
  );
};
