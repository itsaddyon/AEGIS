import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell } from "recharts";
import { Shield, Zap, TrendingUp, HelpCircle } from "lucide-react";
import { Tooltip } from "../common/Tooltip";

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

interface LiveStatsProps {
  packets: PacketData[];
  isRunning: boolean;
}

const COLORS = {
  HTTPS: "#10b981", // emerald
  HTTP: "#f59e0b",  // amber
  ARP: "#f43f5e",   // rose
  DNS: "#6366f1",   // indigo
  TCP: "#3b82f6",   // blue
  UDP: "#06b6d4",   // cyan
  ICMP: "#8b5cf6",  // violet
  OTHER: "#64748b"  // slate
};

export const LiveStats: React.FC<LiveStatsProps> = ({ packets, isRunning }) => {
  // 1. Calculate general stats
  const totalPackets = packets.length;
  
  const totalBytes = useMemo(() => {
    return packets.reduce((acc, pkt) => acc + pkt.length, 0);
  }, [packets]);

  const protocolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    packets.forEach((p) => {
      counts[p.protocol] = (counts[p.protocol] || 0) + 1;
    });
    return counts;
  }, [packets]);

  const dominantProtocol = useMemo(() => {
    let max = 0;
    let proto = "-";
    Object.entries(protocolCounts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        proto = k;
      }
    });
    return { name: proto, count: max };
  }, [protocolCounts]);

  // 2. Prepare Protocol Pie Chart Data
  const pieData = useMemo(() => {
    return Object.entries(protocolCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [protocolCounts]);

  // 3. Prepare Packet Rate Timeline (last 15 seconds bucketed or simple rolling window)
  const timelineData = useMemo(() => {
    if (packets.length === 0) return [];
    
    // Group packets by seconds in their timestamp
    const buckets: Record<string, { count: number; bytes: number }> = {};
    
    // Get last 20 packets or parse timestamps
    packets.slice(-100).forEach((p) => {
      try {
        // Truncate to second: e.g. "2026-07-14T02:22:48.123Z" -> "02:22:48"
        const timePart = p.timestamp.substring(11, 19); 
        if (timePart) {
          if (!buckets[timePart]) {
            buckets[timePart] = { count: 0, bytes: 0 };
          }
          buckets[timePart].count += 1;
          buckets[timePart].bytes += p.length;
        }
      } catch (e) {
        // fallback
      }
    });

    return Object.entries(buckets)
      .map(([time, val]) => ({
        time,
        packets: val.count,
        kb: parseFloat((val.bytes / 1024).toFixed(2))
      }))
      .slice(-15); // Show last 15 active seconds
  }, [packets]);

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Packets */}
        <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center gap-4">
          <div className="p-3 rounded-md bg-teal/10 dark:bg-teal/5 text-teal dark:text-[#52a39c]">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">
              Total Inspected
            </span>
            <div className="text-xl font-extrabold text-[#3A4048] dark:text-[#EFEDE6] leading-none mt-1">
              {totalPackets}
            </div>
            <span className="text-[9px] text-slate-light font-mono block mt-0.5">
              <Tooltip termKey="packet">Packets</Tooltip> buffer
            </span>
          </div>
        </div>

        {/* Card 2: Total Volume */}
        <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center gap-4">
          <div className="p-3 rounded-md bg-indigo-500/10 text-indigo-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">
              Data Throughput
            </span>
            <div className="text-xl font-extrabold text-[#3A4048] dark:text-[#EFEDE6] leading-none mt-1">
              {totalBytes > 1024 * 1024
                ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
                : `${(totalBytes / 1024).toFixed(1)} KB`}
            </div>
            <span className="text-[9px] text-slate-light font-mono block mt-0.5">
              <Tooltip termKey="payload">Payload</Tooltip> size
            </span>
          </div>
        </div>

        {/* Card 3: Dominant Protocol */}
        <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center gap-4">
          <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-500">
            <Shield size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">
              Main Protocol
            </span>
            <div className="text-xl font-extrabold text-[#3A4048] dark:text-[#EFEDE6] leading-none mt-1 font-mono">
              {dominantProtocol.name}
            </div>
            <span className="text-[9px] text-slate-light block mt-0.5">
              {dominantProtocol.count} segments ({totalPackets > 0 ? Math.round((dominantProtocol.count / totalPackets) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Card 4: Capture Status */}
        <div className="glass-panel p-4 rounded-lg bg-white dark:bg-charcoal flex items-center gap-4">
          <div className={`p-3 rounded-md ${isRunning ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-rose-500/10 text-rose-500'}`}>
            <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-rose-500'} block`}></span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">
              Sniffer Status
            </span>
            <div className="text-xl font-extrabold text-[#3A4048] dark:text-[#EFEDE6] leading-none mt-1">
              {isRunning ? "Listening..." : "Stopped"}
            </div>
            <span className="text-[9px] text-slate-light block mt-0.5 font-mono">
              Mode: <Tooltip termKey="interface">Socket Sniff</Tooltip>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Pie Chart (1/3 width) */}
        <div className="glass-panel p-5 rounded-lg bg-white dark:bg-charcoal flex flex-col h-72">
          <h3 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>Protocol Distribution</span>
            <span title="Proportion of network layers captured in this session.">
              <HelpCircle size={12} className="text-slate-light" />
            </span>
          </h3>
          <div className="flex-1 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(38, 40, 44, 0.9)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#EFEDE6",
                      fontSize: "11px",
                      fontFamily: "monospace"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-light italic">
                No active traffic data to chart.
              </div>
            )}
          </div>
          {/* Pie Chart Legend */}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-3 max-h-16 overflow-y-auto pt-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate dark:text-slate-light font-mono bg-canvas dark:bg-graphite px-2 py-0.5 rounded border border-border/40 dark:border-border-dark/40">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] || COLORS.OTHER }}
                  />
                  <span>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bandwidth / Packet Rate Area Chart (2/3 width) */}
        <div className="glass-panel p-5 rounded-lg bg-white dark:bg-charcoal flex flex-col h-72 lg:col-span-2">
          <h3 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6] uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>Traffic Rate over Time</span>
              <span title="Real-time data throughput velocity measured in Kilobytes (KB) per second.">
                <HelpCircle size={12} className="text-slate-light" />
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-light font-normal lowercase">(last 15 active seconds)</span>
          </h3>
          <div className="flex-1">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3F7D77" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3F7D77" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#8B93A1", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={{ stroke: "rgba(91,100,112,0.2)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8B93A1", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={{ stroke: "rgba(91,100,112,0.2)" }}
                    tickLine={false}
                  />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(38, 40, 44, 0.9)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#EFEDE6",
                      fontSize: "11px",
                      fontFamily: "monospace"
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kb"
                    name="Traffic (KB/s)"
                    stroke="#3F7D77"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorKb)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-border dark:border-border-dark rounded-md text-xs text-slate-light italic p-6">
                <span>Visual graph is sleeping.</span>
                <span className="text-[10px] mt-1 not-italic font-mono">Activate capture to stream live chart data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
