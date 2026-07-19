<div align="center">
  <img src="./frontend/public/logo.png" alt="VISTA Logo" width="500" />
</div>

# VISTA: Visualized Information on Security & Traffic Analysis

**VISTA** is an independent, standalone network monitoring utility. It forms the real-time traffic analysis pillar of the optional AEGIS ecosystem.

## Features
- **Professional Network Monitoring:** Inspects active network adapters to map live bandwidth usage, tracking TCP, UDP, and ICMP protocols.
- **Geographic Routing Visualization:** Identifies source and destination IP addresses mapping to geospatial regions.
- **DDoS Mitigation Analytics:** Tracks spike anomalies in traffic density to help isolate potential Denial of Service events.
- **Strict Real-Time Analytics:** VISTA operates strictly on live network data and avoids synthetic simulation tricks to maintain absolute professional integrity.

## Architecture
VISTA uses a modular, local-first architecture:
- **Frontend:** React + Vite, styled with a high-contrast dark mode glassmorphic UI.
- **Backend:** Python 3.11 with a PyWebView bridge.

## Running VISTA

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

**VISTA (AEGIS Security Suite)** was designed and developed by **Adarsh Arya** as an internship project for **CodeAlpha**.

© 2026 Adarsh Arya. All Rights Reserved.

*Unauthorized commercial distribution, modification, or reproduction of this software without explicit permission is strictly prohibited.*
