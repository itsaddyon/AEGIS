<div align="center">
  <img src="./frontend/public/logo.png" alt="CAST Logo" width="500" />
</div>

# CAST: Cyber Awareness Simulation Trainer

**CAST** is an independent, standalone gamified training platform. It forms the educational and SecOps training pillar of the optional AEGIS ecosystem.

## Features
- **Interactive Practice Labs:** Simulated environments teaching defensive cyber operations, password entropy, and social engineering vector analysis.
- **Progress Tracking:** Local gamification engine that tracks XP, cyber ranks, and mission completion.
- **Dynamic Certification:** Users who complete all simulations and missions can claim and print a digitally "signed" Certificate of Competency.

## Architecture
CAST uses a modular, local-first architecture:
- **Frontend:** React + Vite, styled with a high-contrast dark mode glassmorphic UI.
- **Backend:** Python 3.11 with a PyWebView bridge.
- **Database:** Local SQLite utilizing the `%LOCALAPPDATA%` directory to securely store user progress without requiring cloud synchronization or elevated privileges.

## Running CAST

**Development Mode:**
```powershell
npm run dev --prefix frontend
python backend/main.py --dev
```

**Production Build:**
```powershell
python build_exe.py
```
