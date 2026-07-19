import React from "react";
import { Terminal, Cpu, Book } from "lucide-react";
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
  headers?: Record<string, Record<string, string>>;
  payload_hex?: string;
  payload_ascii?: string;
  src_dns?: string;
  dst_dns?: string;
  src_label?: string;
  dst_label?: string;
}

interface PacketDetailProps {
  packet: PacketData | null;
}

export const PacketDetail: React.FC<PacketDetailProps> = ({ packet }) => {
  if (!packet) {
    return (
      <div className="glass-panel p-6 rounded-lg bg-white dark:bg-charcoal h-full flex flex-col items-center justify-center text-center text-slate-light border-dashed border border-border dark:border-border-dark">
        <Terminal size={32} className="mb-3 text-slate-light animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Packet Inspector</h3>
        <p className="text-xs max-w-xs leading-relaxed">
          Select any packet from the table stream above to inspect its headers, ASCII content, and view its educational explanation.
        </p>
      </div>
    );
  }

  // 1. Generate Custom Educational Explanations (Translating numbers into plain-English stories)
  const getEducationalExplanation = () => {
    const proto = packet.protocol.toUpperCase();
    const src = packet.src_ip;
    const dst = packet.dst_ip;
    const sport = packet.src_port;
    const dport = packet.dst_port;

    switch (proto) {
      case "DNS":
        return `Your computer (${src}) initiated a DNS lookup request. It contacted the DNS server (${dst}) to resolve a website's name into a numerical IP address. It is like looking up a friend's name in a address book to find their cell phone number.`;
      case "ARP":
        return `An Address Resolution Protocol (ARP) message was broadcasted inside the local network. A device is shouting: "Who owns the IP address ${dst}? Tell me your physical hardware address (MAC address)!" When the owner replies, they can talk directly.`;
      case "TCP":
        return `This is a TCP data segment moving between ${src} (Port ${sport}) and ${dst} (Port ${dport}). It is a reliable connection-oriented exchange. Think of it like a phone call: the two computers are on the line, acknowledging every sentence to make sure nothing is missed.`;
      case "UDP":
        return `A UDP datagram was transmitted from ${src} to ${dst}. Unlike TCP, UDP doesn't establish a formal phone call first. It acts like a megaphone broadcast or postcards: quick, lightweight, but without verifying if the receiver heard it.`;
      case "HTTP":
        return `An unencrypted HTTP web request or response occurred on Port ${dport || sport}. Your browser is fetching web files in plain text from the server. WARNING: Since this is not encrypted, anyone listening on your network can read your data (like writing on a postcard).`;
      case "HTTPS":
        return `An encrypted HTTPS secure session is running between your browser and the website ${dst} on Port 443. The payload is fully wrapped in cryptographic keys (TLS/SSL), making it unreadable to anyone trying to snoop on your local network connection.`;
      case "ICMP":
        return `This is a diagnostic ICMP packet (commonly a "Ping"). Device ${src} is tapping ${dst} on the shoulder, asking: "Are you online and reachable?" This helps administrators diagnose connection speeds and reachability.`;
      default:
        return `A packet using protocol "${proto}" was transferred between ${src} and ${dst}. Large datasets are chopped into small envelopes (packets) like this one, routed across the network, and reconstituted by the receiver.`;
    }
  };

  // 2. Format Hex and ASCII side-by-side (like Wireshark hex views)
  const renderHexDump = () => {
    if (!packet.payload_hex) return <div className="text-xs text-slate-light italic font-mono">No payload bytes.</div>;

    // Split hex bytes by space
    const bytes = packet.payload_hex.split(" ");
    const rows = [];
    const bytesPerRow = 16;

    for (let i = 0; i < bytes.length; i += bytesPerRow) {
      const rowBytes = bytes.slice(i, i + bytesPerRow);
      // Index column (hex offset)
      const offset = i.toString(16).toUpperCase().padStart(4, "0");
      
      // Hex representation column
      const hexText = rowBytes.join(" ").padEnd(47, " ");

      // ASCII representation column
      const asciiChars = rowBytes.map((b) => {
        const val = parseInt(b, 16);
        // Printable ASCII range (32 to 126)
        return val >= 32 && val <= 126 ? String.fromCharCode(val) : ".";
      }).join("");

      rows.push(
        <div key={i} className="flex gap-4 font-mono text-[11px] leading-none py-0.5 select-text hover:bg-canvas/50 dark:hover:bg-slate-dark/30">
          <span className="text-teal/70 dark:text-[#52a39c]/70 font-semibold">{offset}</span>
          <span className="text-[#3A4048] dark:text-[#EFEDE6]">{hexText}</span>
          <span className="text-slate-light font-medium">{asciiChars}</span>
        </div>
      );
    }

    return <div className="space-y-0.5 overflow-x-auto select-text">{rows}</div>;
  };

  return (
    <div className="glass-panel p-5 rounded-lg bg-white dark:bg-charcoal flex flex-col h-full">
      {/* Title */}
      <div className="border-b border-border dark:border-border-dark pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-teal dark:text-[#52a39c]" size={18} />
          <div>
            <h3 className="text-sm font-bold text-[#3A4048] dark:text-[#EFEDE6] uppercase tracking-wider leading-none">
              Packet Inspection Panel
            </h3>
            <span className="text-[9px] text-slate-light font-mono font-medium">PACKET ID: {packet.id.substring(0, 8)}</span>
          </div>
        </div>
        <div className="text-[10px] font-mono font-bold bg-canvas dark:bg-graphite px-2 py-0.5 rounded border border-border/40 dark:border-border-dark/40 text-slate dark:text-slate-light animate-pulse">
          {packet.length} BYTES
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto space-y-5 mt-4 pr-1.5 custom-scrollbar">
        {/* 1. Educational Metaphor Explanation */}
        <div className="p-4 bg-teal/5 dark:bg-[#3F7D77]/5 border-l-4 border-teal dark:border-[#52a39c] rounded-r-md">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Book className="text-teal dark:text-[#52a39c]" size={14} />
            <h4 className="text-xs font-bold text-teal dark:text-[#52a39c] uppercase tracking-wider">
              Plain-English Story
            </h4>
          </div>
          <p className="text-xs text-slate dark:text-slate-light leading-relaxed">
            {getEducationalExplanation()}
          </p>
        </div>

        {/* 2. Decoded Headers Grid */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-light uppercase tracking-wider flex items-center gap-1.5">
            <Cpu size={12} /> Decoded Header Envelopes
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {/* IP layer headers */}
            {packet.headers && (packet.headers.IP || packet.headers.IPv6) && (
              <div className="bg-canvas/50 dark:bg-graphite/40 border border-border/40 dark:border-border-dark/30 rounded p-3 text-xs leading-relaxed space-y-1">
                <div className="font-bold border-b border-border/40 dark:border-border-dark/40 pb-1 mb-1.5 text-teal dark:text-[#52a39c] font-mono text-[10px] uppercase">
                  Internet Protocol (IP) Envelope
                </div>
                
                <div className="flex justify-between font-mono text-[11px] border-b border-border/10 dark:border-border-dark/10 pb-1 mb-1">
                  <span className="text-slate-light">Version:</span>
                  <span className="font-semibold">{packet.headers.IP ? "IPv4" : "IPv6"}</span>
                </div>
                
                {/* Source Details */}
                <div className="flex flex-col border-b border-border/10 dark:border-border-dark/10 pb-1 mb-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-light">Source IP:</span>
                    <span className="font-bold text-[#3A4048] dark:text-[#EFEDE6]">{packet.src_ip}</span>
                  </div>
                  {packet.src_dns && (
                    <div className="flex justify-between font-mono text-[10px] text-teal dark:text-[#52a39c]">
                      <span className="text-slate-light">Source Host:</span>
                      <span className="font-medium truncate pl-2 text-right" title={packet.src_dns}>{packet.src_dns}</span>
                    </div>
                  )}
                  {packet.src_label && (
                    <div className="flex justify-between font-mono text-[10px] text-slate-light">
                      <span className="text-slate-light">Source Info:</span>
                      <span className="font-medium truncate pl-2 text-right" title={packet.src_label}>{packet.src_label}</span>
                    </div>
                  )}
                </div>

                {/* Destination Details */}
                <div className="flex flex-col border-b border-border/10 dark:border-border-dark/10 pb-1 mb-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-light">Dest IP:</span>
                    <span className="font-bold text-[#3A4048] dark:text-[#EFEDE6]">{packet.dst_ip}</span>
                  </div>
                  {packet.dst_dns && (
                    <div className="flex justify-between font-mono text-[10px] text-teal dark:text-[#52a39c]">
                      <span className="text-slate-light">Dest Host:</span>
                      <span className="font-medium truncate pl-2 text-right" title={packet.dst_dns}>{packet.dst_dns}</span>
                    </div>
                  )}
                  {packet.dst_label && (
                    <div className="flex justify-between font-mono text-[10px] text-slate-light">
                      <span className="text-slate-light">Dest Info:</span>
                      <span className="font-medium truncate pl-2 text-right" title={packet.dst_label}>{packet.dst_label}</span>
                    </div>
                  )}
                </div>

                {packet.headers.IP ? (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light"><Tooltip termKey="ttl">TTL (Time to Live)</Tooltip>:</span>
                      <span className="font-semibold">{packet.headers.IP.ttl || "64"}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Header Checksum:</span>
                      <span className="font-semibold">0x{parseInt(packet.headers.IP.chksum || "0").toString(16).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Packet Identification:</span>
                      <span className="font-semibold">{packet.headers.IP.id || "0"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Traffic Class:</span>
                      <span className="font-semibold">{packet.headers.IPv6?.tc || "0"}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Transport layer headers (TCP/UDP/ICMP/ARP) */}
            {packet.headers && (packet.headers.TCP || packet.headers.UDP || packet.headers.ICMP || packet.headers.ARP) && (
              <div className="bg-canvas/50 dark:bg-graphite/40 border border-border/40 dark:border-border-dark/30 rounded p-3 text-xs leading-relaxed space-y-1">
                <div className="font-bold border-b border-border/40 dark:border-border-dark/40 pb-1 mb-1.5 text-teal dark:text-[#52a39c] font-mono text-[10px] uppercase">
                  Transport Layer ({packet.protocol}) Header
                </div>

                {/* TCP detail */}
                {packet.headers.TCP && (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Source <Tooltip termKey="port">Port</Tooltip>:</span>
                      <span className="font-semibold">{packet.headers.TCP.sport}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Dest <Tooltip termKey="port">Port</Tooltip>:</span>
                      <span className="font-semibold">{packet.headers.TCP.dport}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Sequence No:</span>
                      <span className="font-semibold">{packet.headers.TCP.seq}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">TCP Flags:</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/20 px-1 rounded text-[10px]">
                        <Tooltip termKey="handshake">{packet.headers.TCP.flags}</Tooltip>
                      </span>
                    </div>
                  </>
                )}

                {/* UDP detail */}
                {packet.headers.UDP && (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Source <Tooltip termKey="port">Port</Tooltip>:</span>
                      <span className="font-semibold">{packet.headers.UDP.sport}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Dest <Tooltip termKey="port">Port</Tooltip>:</span>
                      <span className="font-semibold">{packet.headers.UDP.dport}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">UDP Length:</span>
                      <span className="font-semibold">{packet.headers.UDP.len} Bytes</span>
                    </div>
                  </>
                )}

                {/* ICMP detail */}
                {packet.headers.ICMP && (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">ICMP Type:</span>
                      <span className="font-semibold">{packet.headers.ICMP.type === "8" ? "8 (Echo Request)" : packet.headers.ICMP.type === "0" ? "0 (Echo Reply)" : packet.headers.ICMP.type}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">ICMP Code:</span>
                      <span className="font-semibold">{packet.headers.ICMP.code}</span>
                    </div>
                  </>
                )}

                {/* ARP detail */}
                {packet.headers.ARP && (
                  <>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Operation:</span>
                      <span className="font-semibold text-teal dark:text-[#52a39c] font-bold">
                        {packet.headers.ARP.op === "1" ? "1 (Request)" : "2 (Reply)"}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Sender Hardware (<Tooltip termKey="mac">MAC</Tooltip>):</span>
                      <span className="font-semibold text-[10px]">{packet.headers.ARP.hwsrc}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-light">Sender Protocol (<Tooltip termKey="ip">IP</Tooltip>):</span>
                      <span className="font-semibold">{packet.headers.ARP.psrc}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Raw Payload Hex/ASCII View */}
        <div className="flex flex-col space-y-2 min-h-[160px] pb-2">
          <h4 className="text-[10px] font-bold text-slate-light uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={12} /> Dual Hex &amp; ASCII Payload Dump
          </h4>
          <div className="bg-graphite dark:bg-black border border-border-dark p-3.5 rounded text-[#EFEDE6] overflow-y-auto max-h-52 min-h-[120px]">
            {renderHexDump()}
          </div>
        </div>
      </div>
    </div>
  );
};

