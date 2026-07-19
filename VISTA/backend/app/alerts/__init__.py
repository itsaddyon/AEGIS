# Extension point: Intrusion Detection System (IDS)
#
# This package is intentionally empty in this version of VISTA.
# When the IDS module ships, detection rules and analyzers will live
# here and register themselves with capture.sniffer.capture_engine
# via CaptureEngine.on_packet, without any changes to the capture
# engine, routes, or frontend contract (GET /api/alerts already
# returns the correct shape).
