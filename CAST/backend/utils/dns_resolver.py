"""
Asynchronous DNS resolver and IP labeling engine.
Provides instant lookups for local/common IPs and executes external DNS lookups
in a background thread pool to prevent blocking the capture loop.
"""
import socket
import threading
from concurrent.futures import ThreadPoolExecutor

class DNSResolver:
    def __init__(self):
        # Seed cache with well-known IPs
        self.cache = {
            "127.0.0.1": ("localhost", "Local Loopback / Host Machine"),
            "0.0.0.0": ("any", "Broadcast / Any Adapter"),
            "255.255.255.255": ("broadcast", "Local Network Broadcast"),
            "8.8.8.8": ("dns.google", "Google Public DNS (Primary)"),
            "8.8.4.4": ("dns.google", "Google Public DNS (Secondary)"),
            "1.1.1.1": ("one.one.one.one", "Cloudflare DNS (Primary)"),
            "1.0.0.1": ("one.one.one.one", "Cloudflare DNS (Secondary)"),
            "9.9.9.9": ("dns.quad9.net", "Quad9 Secure DNS"),
        }
        self.pending = set()
        self.lock = threading.Lock()
        # Bound execution workers to prevent excessive threads
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    def _is_private_ip(self, ip: str) -> bool:
        if not ip or ip == "-":
            return False
        parts = ip.split('.')
        if len(parts) != 4:
            return False
        try:
            p1, p2 = int(parts[0]), int(parts[1])
            if p1 == 10:
                return True
            if p1 == 172 and (16 <= p2 <= 31):
                return True
            if p1 == 192 and p2 == 168:
                return True
        except ValueError:
            pass
        return False

    def _get_private_label(self, ip: str) -> str:
        parts = ip.split('.')
        if len(parts) == 4:
            if parts[3] == "1":
                return "Local Router / Gateway"
        return "Local Network Device"

    def resolve(self, ip: str) -> tuple[str, str]:
        """
        Returns a tuple of (hostname, description_label).
        Does NOT block. Submits unknown public IPs to the worker pool.
        """
        if not ip or ip == "-":
            return "", ""
            
        with self.lock:
            if ip in self.cache:
                return self.cache[ip]
                
        # Multi-cast ranges
        if ip.startswith("224.") or ip.startswith("239."):
            return "multicast", "IP Multicast Group"
            
        # Private LAN ranges
        if self._is_private_ip(ip):
            label = self._get_private_label(ip)
            with self.lock:
                self.cache[ip] = (ip, label)
            return ip, label

        # Unknown public IP: trigger background lookup if not already in flight
        with self.lock:
            if ip not in self.pending:
                self.pending.add(ip)
                self.executor.submit(self._async_lookup, ip)
                
        # Return empty/default indicators while resolving
        return "", "External Internet Device"

    def _async_lookup(self, ip: str):
        try:
            # Query standard host records
            hostname, _, _ = socket.gethostbyaddr(ip)
            label = f"Public Service ({hostname})"
        except Exception:
            hostname = ""
            label = "External Internet Device"
            
        with self.lock:
            self.cache[ip] = (hostname, label)
            if ip in self.pending:
                self.pending.remove(ip)


dns_resolver = DNSResolver()
