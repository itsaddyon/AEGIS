"""
Lists network interfaces available for capture. Wraps Scapy so the
rest of the app never touches Scapy's interface API directly.
"""
from scapy.all import get_if_list, get_if_addr


def list_interfaces() -> list[dict]:
    interfaces = []
    for name in get_if_list():
        try:
            addr = get_if_addr(name)
        except Exception:
            addr = "unknown"
        interfaces.append({"name": name, "address": addr})
    return interfaces
