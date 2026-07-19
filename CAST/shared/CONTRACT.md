# Frontend ↔ Backend Contract

The frontend never talks to SQLite directly. It only calls methods on
`window.pywebview.api`, wrapped by `frontend/src/lib/api.ts`. Keep this file
in sync whenever a method is added/changed on either side.

| Api method | Args | Returns | Used by |
|---|---|---|---|
| `get_profile` | — | Profile | Home, Sidebar |
| `update_display_name` | `name` | Profile | Settings |
| `set_theme` | `theme: 'dark'\|'light'` | Profile | Settings |
| `get_missions` | — | MissionProgress[] | Learning Path |
| `complete_mission` | `mission_id, quiz_score` | GamificationResult | Mission runner |
| `get_simulations` | — | Simulation[] | Practice Lab |
| `submit_simulation_result` | `simulation_id, correct, total` | GamificationResult | Simulations |
| `get_achievements` | — | Achievement[] | Achievements |
| `get_recent_activity` | — | ActivityLogEntry[] | Home, Progress |
| `issue_certificate` | `display_name, final_score` | Certificate | Final Assessment |
| `list_certificates` | — | Certificate[] | Progress |
| `get_daily_challenge` | — | DailyChallenge | Home |

Matching TypeScript types live in `frontend/src/types/index.ts`.

In the browser-only dev mode (`npm run dev`, no PyWebView host), all of
these are mocked in `frontend/src/lib/api.ts` against in-memory data from
`frontend/src/data/`, so the UI is fully explorable without the Python
backend running.
