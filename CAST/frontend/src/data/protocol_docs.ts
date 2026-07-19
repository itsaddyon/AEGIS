export interface ProtocolInfo {
  name: string;
  fullName: string;
  description: string;
  analogy: string;
  whyExists: string;
  commonUses: string[];
  isSafe: 'safe' | 'warning' | 'danger';
  safetyExplanation: string;
  facts: string[];
  diagram: string;
}

export const protocolDocs: Record<string, ProtocolInfo> = {
  TCP: {
    name: "TCP",
    fullName: "Transmission Control Protocol",
    description: "A reliable communication system that makes sure data is delivered correctly and in the right order.",
    analogy: "Like sending a book page-by-page via Certified Mail. The recipient signs a receipt for each page. If page 3 is lost, you resend it until they confirm receipt, ensuring they read the book in order.",
    whyExists: "IP networks are unstable; packets get lost or arrive out of order. TCP acts as a supervisor, checking for errors, requesting missing data, and assembling packets back into their original shape.",
    commonUses: [
      "Loading web pages (HTTP/HTTPS)",
      "Sending and receiving emails (SMTP/IMAP)",
      "Downloading files (FTP)",
      "Connecting to databases"
    ],
    isSafe: "safe",
    safetyExplanation: "TCP itself is a neutral tool for reliability. However, standard TCP packets are unencrypted. Anyone snooping on your network can read the messages inside unless an encryption layer (like TLS/SSL) is added on top.",
    facts: [
      "Designed in 1974 by Vint Cerf and Bob Kahn, the fathers of the Internet.",
      "Uses a 'Three-Way Handshake' (SYN -> SYN-ACK -> ACK) to agree to talk before sending any real data."
    ],
    diagram: `
Client                 Server
  |                      |
  |  --- SYN (Hello) --> |  [Step 1]
  |                      |
  |  <-- SYN-ACK (Ok) -- |  [Step 2]
  |                      |
  |  --- ACK (Got it) -> |  [Step 3]
  v                      v
[Connection Established: Start Sending Data]
`
  },
  UDP: {
    name: "UDP",
    fullName: "User Datagram Protocol",
    description: "A fast, lightweight communication system that sends data without checking if it actually arrived.",
    analogy: "Like throwing postcards into a mailbox. You write them quickly and mail them. Most will arrive, but some might get lost. You don't wait for a reply before sending the next one.",
    whyExists: "Checking for lost packets (like TCP does) takes time and slows things down. For real-time applications like voice calls or gaming, speed is more important than a few dropped pixels or words.",
    commonUses: [
      "Live video streaming (Netflix, YouTube Live)",
      "Online multiplayer games",
      "Voice over IP (Discord, Skype)",
      "Domain Name lookups (DNS)"
    ],
    isSafe: "safe",
    safetyExplanation: "Just like TCP, UDP is neutral but unencrypted by default. In addition, because it doesn't verify who the sender is, hackers can easily spoof (fake) sender addresses to overwhelm networks (called UDP flooding).",
    facts: [
      "No handshakes or connection setup needed. It just shoots packets immediately.",
      "Often used for communication inside local networks where packet loss is extremely rare."
    ],
    diagram: `
Sender                 Receiver
  |                      |
  |  ==== Datagram 1 ==> |  (Fast Delivery)
  |  ==== Datagram 2 ==> |
  |   (Datagram 3 Lost)  x  (No retry! Keep going)
  |  ==== Datagram 4 ==> |
  v                      v
`
  },
  DNS: {
    name: "DNS",
    fullName: "Domain Name System",
    description: "The phonebook of the Internet. It translates easy-to-remember website names into computer-readable IP addresses.",
    analogy: "Like looking up a contact in your phone. You type 'Mom' (google.com) because you can't remember her 10-digit number (142.250.190.46). The phone looks it up and dials the actual number.",
    whyExists: "Computers route data using numbers called IP addresses (e.g. 192.168.1.1). Humans are bad at remembering numbers, so DNS lets us type website names instead.",
    commonUses: [
      "Resolving google.com to an IP when you open your browser",
      "Locating email servers to send mail",
      "Finding gaming servers"
    ],
    isSafe: "warning",
    safetyExplanation: "Traditional DNS requests are sent in plain text, meaning anyone on your Wi-Fi can see which websites you are looking up. Modern standards like DoH (DNS over HTTPS) encrypt this information.",
    facts: [
      "DNS records are cached (remembered) by your computer and router for a set time (TTL) to avoid asking the phonebook over and over again.",
      "If DNS goes down, the Internet is still online, but you have to type raw IP addresses into your browser!"
    ],
    diagram: `
Computer                 DNS Server
  |                          |
  |  - 'Where is google?' -> |  (Query)
  |                          |
  |  <- 'It is at 8.8.8.8' - |  (Answer)
  v                          v
[Now your computer connects directly to 8.8.8.8]
`
  },
  ARP: {
    name: "ARP",
    fullName: "Address Resolution Protocol",
    description: "Helps computers inside a local network find each other's physical hardware addresses.",
    analogy: "Shouting in an office: 'Who here is John Doe? Tell me your desk number!' John shouts back: 'I'm John, I'm at desk 45!' Everyone else ignores the shout.",
    whyExists: "Inside a local network (like your home Wi-Fi), IP addresses aren't enough. Devices need the physical hardware address (MAC address) of a network card to send a packet across the local cable or airwave.",
    commonUses: [
      "Your laptop finding the Wi-Fi router to connect to the Internet",
      "A printer finding your computer to print a document",
      "Devices mapping local IP addresses to physical MAC cards"
    ],
    isSafe: "danger",
    safetyExplanation: "ARP is highly vulnerable because it has no security checks. Any computer can send fake replies claiming to be the router. This allows hackers to intercept or hijack local traffic (called 'ARP Poisoning' or Man-in-the-Middle).",
    facts: [
      "ARP is only used inside your local network. It never travels across the internet.",
      "Devices save local tables (ARP caches) so they don't have to shout for every single packet."
    ],
    diagram: `
Device A (Screaming)       Local Network       Device B (Target)
     |                           |                     |
     |  -- 'Who has 10.0.0.5?' ->|                     |
     |                           |====================>| (Broadcasts to all)
     |                           |                     |
     |  <==== 'I do! My MAC is 00:11:22' ==============| (Direct reply)
     v                                                 v
`
  },
  ICMP: {
    name: "ICMP",
    fullName: "Internet Control Message Protocol",
    description: "A diagnostic protocol used by devices to share status updates, network errors, and check if a machine is online.",
    analogy: "Like tapping someone on the shoulder to ask, 'Are you awake?' They nod and say 'Yes'. That's it.",
    whyExists: "Before sending heavy data, systems need to verify if the path is clear and if the target is online. ICMP is the standard diagnostic channel for routers and servers.",
    commonUses: [
      "The 'ping' command (measuring connection delay)",
      "Traceroute (mapping the hop-by-hop path packets take)",
      "Reporting network errors (e.g. 'Destination Unreachable')"
    ],
    isSafe: "safe",
    safetyExplanation: "ICMP is generally safe and essential for diagnostics. However, hackers can use it to map which computers are online in a network (ping sweeps) or send massive amounts of pings to crash a server (Ping of Death).",
    facts: [
      "Many modern websites disable ICMP ping requests to hide their existence from scanners and stay safe from DDoS attacks.",
      "ICMP doesn't use ports (like TCP and UDP do); it operates directly on top of the IP layer."
    ],
    diagram: `
Laptop                   Router/Server
  |                            |
  |  --- Ping (Are you there?) --> |  (Echo Request)
  |                            |
  |  <-- Pong (Yes, I'm here!) --- |  (Echo Reply)
  v                            v
`
  },
  HTTP: {
    name: "HTTP",
    fullName: "Hypertext Transfer Protocol",
    description: "The classic system used by web browsers to load text, images, and pages from web servers.",
    analogy: "Like writing your credit card details and password on a postcard and mailing it. Anyone along the postal route can read what is written.",
    whyExists: "It was the original protocol created in 1989 to share hypertext documents (webpages). It defines how browsers request pages and how servers respond.",
    commonUses: [
      "Browsing older websites",
      "Internal development testing",
      "Local smart device communication"
    ],
    isSafe: "danger",
    safetyExplanation: "Extremely unsafe for sensitive data! Because it sends everything in plain text, hackers on your network can steal passwords, messages, and credit card info. Always look for the lock icon in your browser!",
    facts: [
      "Created by Sir Tim Berners-Lee at CERN to help physicists share documents.",
      "Runs on Port 80 by default."
    ],
    diagram: `
Browser                  Web Server (Port 80)
  |                            |
  |  -- GET /index.html ---->  |  [Sent in Plain Text!]
  |                            |
  |  <- 200 OK (Web Page HTML) |  [Snoopers can read this!]
  v                            v
`
  },
  HTTPS: {
    name: "HTTPS",
    fullName: "Hypertext Transfer Protocol Secure",
    description: "The secure, encrypted version of HTTP. It creates a private tunnel between your browser and the website.",
    analogy: "Like putting your credit card details in a bulletproof, double-locked armored safe, sending it to the merchant, and opening it with keys only you two share.",
    whyExists: "As the web grew, e-commerce and banking became necessary. HTTPS wraps standard HTTP requests in a TLS/SSL encryption wrap to prevent eavesdropping and faking websites.",
    commonUses: [
      "Modern secure web browsing (Google, Banking, Shopping)",
      "Sending user credentials, passwords, and tokens",
      "Secure API calls"
    ],
    isSafe: "safe",
    safetyExplanation: "The industry standard for secure browsing. It guarantees that the website you connect to is authentic (via certificates) and that no one in the middle can read or modify your data.",
    facts: [
      "Most modern web browsers (Chrome, Safari, Firefox) now block or warn you about any site NOT using HTTPS.",
      "Uses Port 443 by default."
    ],
    diagram: `
Browser                  Secure Server (Port 443)
  |                            |
  |  -- Handshake request -->  |  (Set up encryption keys)
  |  <- Trust Certificate ----  |  (Verify identity)
  |                            |
  |  <====== Encrypted Tunnel ====> (Data sent securely!)
  v                            v
`
  }
};
