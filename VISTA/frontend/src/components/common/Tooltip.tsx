import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

export const GLOSSARY: Record<string, { term: string; definition: string; analogy: string }> = {
  handshake: {
    term: "Handshake",
    definition: "An introductory greeting process where two devices agree on rules and encryption keys before sending any real data.",
    analogy: "Like two business partners shaking hands and agreeing to speak in English before signing a contract."
  },
  payload: {
    term: "Payload",
    definition: "The actual message, file chunk, or content carried inside the packet, excluding the routing envelope headers.",
    analogy: "Like the letter inside an envelope. The headers are the stamps and addresses on the outside; the payload is the message."
  },
  ip: {
    term: "IP Address",
    definition: "A unique numerical identifier assigned to every device on a network so they know where to direct data.",
    analogy: "Like your physical home mailing address. It tells the mailman exactly where to deliver letters."
  },
  port: {
    term: "Port",
    definition: "A virtual door number on a computer that directs traffic to specific programs (e.g. Port 80/443 for web pages).",
    analogy: "Like apartment numbers in a large building. The IP is the building address; the Port is the specific apartment."
  },
  mac: {
    term: "MAC Address",
    definition: "A permanent, physical serial number built directly into a device's network hardware card by the factory.",
    analogy: "Like a car's VIN (Vehicle Identification Number). It never changes, unlike license plates (IP addresses) which can."
  },
  packet: {
    term: "Packet",
    definition: "A small piece of a larger file sent across a network. Files are split into packets, sent, and put back together.",
    analogy: "Like shipping a LEGO castle in individual boxes. Once they all arrive, you assemble them into the castle."
  },
  ttl: {
    term: "TTL (Time to Live)",
    definition: "A safety counter that tells routers how many hops a packet is allowed to make before it is destroyed.",
    analogy: "Like an expiration date on milk. It stops lost packets from circulating forever and clogging the internet."
  },
  interface: {
    term: "Network Interface",
    definition: "The hardware connection (like Wi-Fi or Ethernet card) that a computer uses to talk to the rest of the network.",
    analogy: "Like a phone line or radio antenna that allows you to send and receive signals."
  },
  sniffer: {
    term: "Sniffer",
    definition: "A tool that listens to and records packets passing through a network interface.",
    analogy: "Like a friendly security guard listening to local radio waves or inspecting delivery envelopes."
  }
};

interface TooltipProps {
  termKey: keyof typeof GLOSSARY;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ termKey, children, showIcon = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const data = GLOSSARY[termKey];

  if (!data) return <>{children}</>;

  return (
    <span className="relative inline-flex items-center group">
      <span
        className="cursor-help border-b border-dotted border-teal text-teal dark:text-[#52a39c] font-medium hover:text-[#2d5d58]"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || data.term}
      </span>
      {showIcon && (
        <HelpCircle
          size={12}
          className="ml-1 text-slate-light cursor-help inline"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        />
      )}

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50 p-3 bg-white dark:bg-charcoal border border-border dark:border-border-dark rounded-md shadow-lg text-xs leading-relaxed text-[#3A4048] dark:text-[#EFEDE6] animate-fade-in pointer-events-none">
          <div className="font-bold text-teal dark:text-[#52a39c] border-b border-border dark:border-border-dark pb-1 mb-1.5 flex items-center justify-between">
            <span>{data.term}</span>
            <span className="text-[10px] text-slate-light font-normal">Plain English</span>
          </div>
          <p className="mb-2">{data.definition}</p>
          <div className="bg-canvas dark:bg-[#1E1F22] p-1.5 rounded text-[11px] italic text-[#5B6472] dark:text-[#8B93A1]">
            <span className="font-semibold not-italic text-teal dark:text-[#52a39c] block text-[9px] uppercase tracking-wider">Analogy</span>
            {data.analogy}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white dark:border-t-charcoal"></div>
        </div>
      )}
    </span>
  );
};
