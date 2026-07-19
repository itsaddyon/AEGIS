<div align="center">
  <img src="./frontend/public/logo.png" alt="ARGUS Logo" width="500" />
</div>

# ARGUS: Advanced Real-time Guardian for Unified Security

**ARGUS** is an independent, standalone Network Intrusion Detection System (NIDS) and threat investigation console. It forms the threat-detection pillar of the optional AEGIS ecosystem.

## Features
- **Real-Time Deep Packet Inspection:** Leverages Scapy to monitor active network interfaces.
- **Heuristic Rule Engine:** Snort-compatible detection cycles identify malicious patterns (e.g., port scans, brute force, ARP spoofing).
- **Incident Investigation:** Generates actionable Case Files with remediation lessons and threat confidence scores.
- **On-Demand Simulation:** Includes a "Simulate Threat" mechanism to inject synthetic malicious traffic for presentation and evaluation purposes without requiring a live hostile network.

## Architecture
ARGUS uses a modular, local-first architecture:
- **Frontend:** React + Vite, styled with a high-contrast dark mode glassmorphic UI.
- **Backend:** Python 3.11 with a PyWebView bridge.
- **Database:** Local SQLite utilizing the `%LOCALAPPDATA%` directory for secure, permission-safe storage.

## Running ARGUS

**Development Mode:**
```powershell
npm run dev --prefix frontend
python backend/main.py --dev
```

**Production Build:**
```powershell
python build_exe.py
```

---

## 📜 Copyright & Credits

**ARGUS (AEGIS Security Suite)** was designed and developed by **Adarsh Arya** as an internship project for **CodeAlpha**.

© 2026 Adarsh Arya. All Rights Reserved.

*Unauthorized commercial distribution, modification, or reproduction of this software without explicit permission is strictly prohibited.*
