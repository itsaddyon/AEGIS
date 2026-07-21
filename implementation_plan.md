# AEGIS Launcher Redesign & Real Telemetry

Revamp the AEGIS Launcher to feature an immersive, premium, high-tech cybersecurity suite appearance. The redesign will add real-time hardware telemetry (CPU/RAM) fetched from Python using `psutil`, animated real-time line charts, and an interactive, luring user interface.

## Proposed Changes

### Backend Subsystem

#### [MODIFY] [run.py](file:///d:/Btech%20Projects/AEGIS/launcher/run.py)
- Import `psutil` inside `status_poller` (or fall back to simulated stats if it fails).
- Include `_cpu` and `_ram` percentages in the status payload pushed to the frontend every 1–2 seconds.
- Refactor `get_all_status` to use `psutil` for robust process scanning, checking for both production `.exe` matches and development `python` processes whose arguments contain the target module directory.

---

### Frontend Subsystem

#### [MODIFY] [index.html](file:///d:/Btech%20Projects/AEGIS/launcher/index.html)
- Redesign the Boot Screen with a cybernetic grid backdrop, status scanlines, and high-tech initialization sequence text.
- Revamp the top header bar to feature a live digital clock (with milliseconds) and a "threat level index" HUD element.
- Replace the simple telemetry bars with a dual-canvas visualizer panel for real-time CPU and RAM line charts.
- Restructure module cards (ARGUS, CAST, VISTA) to support high-tech borders, status light indicators, and secondary sub-system stats.
- Add full form: **Advanced Ecosystem for Global Information Security** below the main header.
- Add developer credits: **By Adarsh Arya** in the sidebar footer.
- Redesign the System Overview (About View) with four highly detailed cards covering the overall AEGIS Ecosystem architecture and each of the three security pillars (ARGUS NIDS, CAST Training Labs, VISTA Traffic Analysis) outlining what users get and what each tool does.

#### [MODIFY] [style.css](file:///d:/Btech%20Projects/AEGIS/launcher/src/style.css)
- Revise the color palette to use rich dark hues (deep slate, rich charcoal, neon cyan, electric blue, glowing amber/emerald).
- Implement backdrop-blur glassmorphic panels and glowing border styles.
- Add scanning line animations, keyframe transitions, and cyber-grid background overlays.
- Stylize the event console to feel like a high-contrast CRT terminal.

#### [MODIFY] [main.js](file:///d:/Btech%20Projects/AEGIS/launcher/src/main.js)
- Read the real `_cpu` and `_ram` values pushed from the Python daemon.
- Implement a HTML5 Canvas rendering loop that maintains history queues for CPU and RAM, drawing smooth anti-aliased charts with fading gradient fills and cyber grids.
- Hold boot screen preloader dismissal until both the 2.7s animation finishes AND first status payload is received from the Python backend (with a 4.5s fallback to diagnostic standalone mode if IPC is delayed).
- Enrich the boot text sequences to look like a true kernel loading log.

---

## Verification Plan

### Automated/Manual Verification
1. Run `npm run build` in the launcher directory to compile the frontend assets.
2. Run `python run.py` in the launcher directory to start the pywebview shell.
3. Observe the boot preloader sequence, ensuring it blocks until data is fetched.
4. Verify that the CPU and RAM charts render smooth, real-time lines that fluctuate in response to real system load.
5. Verify launcher controls (minimize, maximize, close) work correctly.
6. Compile the standalone executable using `python build_exe.py` and run it to verify production stability.
