<div align="center">
  <img src="./aegis-logo.png" alt="AEGIS Security Suite Logo" width="600" />
</div>

# AEGIS Security Suite
### Advanced Ecosystem for Global Information Security

**AEGIS** is a modular, high-performance cybersecurity suite designed to provide comprehensive network monitoring, intrusion detection, and interactive security training. 

This repository contains three **independent, standalone projects**. Each project is fully self-contained, featuring its own dedicated backend engine, database, and frontend UI. They do not rely on each other to function and can be evaluated entirely separately.

However, as an advanced engineering initiative, the suite features **Optional Ecosystem Interoperability**. If all three projects are cloned together into the same directory, their respective UI launchers can intelligently cross-launch the other modules, forming a unified "Suite" experience.

---

## 📂 Repository Structure & Submission Format

If you are evaluating this project, you may notice it is submitted as three distinct links pointing to sub-folders of this main repository:

1. `github.com/itsaddyon/Codealpha_AEGIS/ARGUS`
2. `github.com/itsaddyon/Codealpha_AEGIS/CAST`
3. `github.com/itsaddyon/Codealpha_AEGIS/VISTA`

**You can clone and run any of these sub-folders individually.** However, to utilize the Ecosystem Cross-Launch features found in the sidebars of the apps, you must clone the **entire AEGIS parent repository** so that the folders sit adjacent to one another.

---

## 🛡️ The Core Modules

### 1. [ARGUS](./ARGUS) - Advanced Real-time Guardian for Unified Security
A real-time Network Intrusion Detection System (NIDS) and threat investigation console. It utilizes deep packet inspection and heuristic Snort-like rules to identify malicious network behavior (such as port scans and brute force attacks).

### 2. [CAST](./CAST) - Cyber Awareness Simulation Trainer
An interactive gamified training platform designed to teach security operations (SecOps) through practical, simulated lab environments (e.g., detecting phishing vectors and auditing password entropy).

### 3. [VISTA](./VISTA) - Visualized Information on Security & Traffic Analysis
A sleek, professional network traffic monitor. Designed for deep-packet inspection, live bandwidth mapping, and geographic IP routing visualization without reliance on synthetic simulation.

---

## Beginner's Setup Guide

Don't worry if you're new to Python or Node.js! Follow these exact steps to get any of the 3 projects running on your Windows machine.

### Prerequisites (What you need installed)
1. **Python 3.11+**: Download from [python.org](https://www.python.org/downloads/). *Crucial: During installation, check the box that says "Add Python.exe to PATH".*
2. **Node.js**: Download from [nodejs.org](https://nodejs.org/). (The LTS version is recommended).
3. **Npcap**: VISTA and ARGUS require packet capture drivers. Download and install [Npcap](https://npcap.com/#download). *Crucial: Ensure "Install Npcap in WinPcap API-compatible Mode" is checked.*

### Step-by-Step Installation (Development Mode)

Pick the module you want to run (e.g., `ARGUS`), and open **two** separate command prompts (Terminal windows) inside that folder.

**Terminal 1: Start the Frontend UI**
```powershell
cd ARGUS/frontend
npm install
npm run dev
```
*(Leave this terminal running in the background).*

**Terminal 2: Start the Python Backend**
```powershell
cd ARGUS
pip install -r backend/requirements.txt
python backend/main.py --dev
```
*(For VISTA, the backend script is `python backend/run.py` instead of `main.py`)*

The application window will automatically pop up!

---

## Building Standalone Executables (.exe)
If you want to compile the project into a double-clickable Windows `.exe` so you don't have to use the terminal anymore, simply run the build script:

```powershell
cd ARGUS
python build_exe.py
```
This will create an `ARGUS.exe` inside the `ARGUS/dist/` folder.

---

## ⚠️ Troubleshooting & FAQ (For Beginners)

**1. "Python is not recognized as an internal or external command"**
*   **Cause:** Python wasn't added to your system PATH during installation.
*   **Fix:** Re-run the Python installer, select "Modify", and ensure "Add Python to environment variables" is checked. Alternatively, use `py` instead of `python` in your terminal.

**2. "npm is not recognized"**
*   **Cause:** Node.js is not installed, or your terminal hasn't refreshed since installing it.
*   **Fix:** Install Node.js, restart your computer (or just restart your terminal), and try again.

**3. "Scapy / Npcap Error: Interface not found or capture failed"**
*   **Cause:** ARGUS and VISTA need to monitor your network adapter, which requires Npcap.
*   **Fix:** Install Npcap (linked in prerequisites). If it still fails, right-click your terminal and select **"Run as Administrator"** before executing the python script.

**4. "I clicked 'Launch VISTA' from inside ARGUS and nothing happened!"**
*   **Cause:** You only cloned the `ARGUS` folder, not the whole `AEGIS` repository. The system is looking for the VISTA folder next to ARGUS and can't find it.
*   **Fix:** Clone the master repository: `git clone https://github.com/itsaddyon/Codealpha_AEGIS.git` so that all three folders sit next to each other.

**5. "Database locked or permission denied errors"**
*   **Cause:** You are trying to run the `.exe` from a read-only directory (like a zipped folder).
*   **Fix:** Extract all files first. Note that all AEGIS modules safely store their SQLite databases in `%LOCALAPPDATA%/AEGIS/` to prevent standard Windows permission issues.
