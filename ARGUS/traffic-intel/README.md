# Reserved — Future VISTA Integration

This folder is intentionally empty of logic.

It exists only as an extension point so that a future version of ARGUS
can optionally consume raw packet/traffic data from **VISTA** (Project 1
of the AEGIS Suite — Visual Interactive Sniffer & Traffic Analyzer),
instead of maintaining its own capture pipeline.

**Do not implement anything here yet.** No APIs, no network calls, no
imports from VISTA. ARGUS must continue to work fully offline and
standalone, generating its own events for the detection engine.
