"""
Serializes the current session's packets to JSON or CSV bytes,
ready to be sent as a file download.
"""
import csv
import io
import json

CSV_FIELDS = [
    "timestamp", "src_ip", "dst_ip", "protocol",
    "src_port", "dst_port", "length", "status", "summary",
]


def to_json(packets: list[dict]) -> str:
    return json.dumps(packets, indent=2)


def to_csv(packets: list[dict]) -> str:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=CSV_FIELDS, extrasaction="ignore")
    writer.writeheader()
    for pkt in packets:
        writer.writerow(pkt)
    return buffer.getvalue()
