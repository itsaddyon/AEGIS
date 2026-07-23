<div align="center">
  <img src="./aegis-logo.png" alt="AEGIS Security Suite Logo" width="600" />

  # AEGIS Security Suite
  **Advanced Ecosystem for Global Information Security**

  [![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-2ea44f?style=for-the-badge&logo=github)](#)
  [![Architecture: Unified Zero-Cloud](https://img.shields.io/badge/Architecture-Unified%20Zero--Cloud-0052cc?style=for-the-badge&logo=shield)](#)
  [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%20(64--bit)-blue?style=for-the-badge&logo=windows)](#)

  *Next-Generation Network Monitoring, Intrusion Detection, and SecOps Training.*
</div>

---

## 🚀 The Master Suite

**AEGIS** is a modular, high-performance cybersecurity ecosystem designed to protect, analyze, and educate. Instead of disjointed tools, AEGIS operates as a **Unified Master Suite**, delivering enterprise-grade capabilities through a single, highly polished graphical interface.

The entire suite is packaged into a **Zero-Footprint Master Executable**. No complex installation wizards, no dependency hell, and absolutely zero cloud reliance. Your data, your network, your machine.

---

## 🛡️ The AEGIS Modules

The AEGIS Master Launcher acts as your central command hub, granting instant, encrypted access to three incredibly powerful subsystems:

### 1. ARGUS (Advanced Real-time Guardian for Unified Security)
Your frontline defense. ARGUS is a standalone **Network Intrusion Detection System (NIDS)** and threat investigation console. 
- **Deep Packet Inspection:** Leverages intelligent Scapy-based network monitoring.
- **Heuristic Rule Engine:** Snort-compatible detection cycles identify malicious patterns instantly (Port scans, DDoS vectors, ARP spoofing).
- **Automated Case Files:** Transforms raw alerts into actionable forensic Case Files with mitigation strategies.

### 2. VISTA (Visualized Information on Security & Traffic Analysis)
Your tactical overwatch. VISTA is a sleek, professional network traffic monitor designed for unprecedented visibility.
- **Live Bandwidth Mapping:** Monitor throughput, packet sizes, and transmission rates in real-time.
- **Geographic Tracing:** Visually trace the origin and destination of packets across global nodes.
- **Protocol Analysis:** Intercept and dissect packet structures at the TCP/UDP and IP layers.

### 3. CAST (Cyber Awareness Simulation Trainer)
Your security academy. CAST is a gamified training platform designed to teach Security Operations (SecOps) through practical, simulated lab environments.
- **Interactive Labs:** Identify phishing vectors, audit password entropy, and analyze malicious binaries.
- **Progression System:** Earn XP and level up your SecOps clearance as you solve increasingly complex threat scenarios.

---

## ⚙️ Architecture & Technology Stack

AEGIS is built utilizing a cutting-edge hybrid tech stack, combining the speed of Python network engineering with the aesthetic supremacy of modern web frameworks.

- **Master Orchestrator:** PyInstaller-compiled `AEGIS_Launcher.exe` acting as a localized module extractor and process manager.
- **Frontend Engines:** React, Vite, and TailwindCSS (Warm Charcoal, Slate, and Muted Teal palette).
- **Backend Engines:** Python 3.11, PyWebView, Scapy (for packet capture), and Flask/Websockets for real-time telemetry.
- **Secure Storage:** All configurations, logs, and SQLite databases are strictly sandboxed into `%LOCALAPPDATA%\AEGIS\`, guaranteeing robust user permission management and zero footprint on external drives.

---

## ⚡ Deployment & Installation

### The 1-Click Method (Recommended)
AEGIS has been compiled into a single, massive 250MB executable that contains the *entire* ecosystem (Python runtime, Node.js frontend bundles, databases, and sub-executables).

1. Download **`AEGIS_Launcher.exe`** from the Releases tab (or locate it in `launcher/dist/`).
2. Double-click the file.
3. The Initial Boot Sequence will invisibly extract and install ARGUS, CAST, and VISTA directly into your secure AppData folder.
4. Create your offline encrypted Vault profile, and you're in.

### Development Mode
If you wish to modify the source code, AEGIS can be run modularly. 

```powershell
# Clone the master repository
git clone https://github.com/itsaddyon/AEGIS.git
cd AEGIS

# To run the master launcher:
cd launcher
npm install
npm run build
python run.py
```
*(Ensure Python 3.11+ and Npcap are installed on your host system).*

---

## 📜 Copyright & License

**AEGIS Security Suite** (including the Master Launcher, ARGUS, CAST, and VISTA) was designed, engineered, and developed by **Adarsh Arya**.

© 2026 Adarsh Arya. All Rights Reserved.

*Unauthorized commercial distribution, modification, or reproduction of this software without explicit written permission is strictly prohibited. AEGIS is intended for authorized network defense and educational purposes only.*
