# Frontend ↔ Backend Contract

The frontend never talks to SQLite directly. It only calls methods on
`window.pywebview.api`. Keep this file in sync whenever a method is
added or changed on either side.

| Api method | Args | Returns | Used by |
|---|---|---|---|
| `list_cases` | `status?` | CaseFile[] (JSON) | Case Files |
| `get_case` | `case_id` | CaseFile (JSON) | Case Detail |
| `update_case_status` | `case_id, status` | bool | Case Detail |
| `toggle_bookmark` | `case_id, bookmarked` | bool | Case Detail |
| `minimize` / `maximize` / `close` | — | — | Title Bar |

Matching TypeScript types live in `frontend/src/lib/types.ts`; the
Python source of truth is `backend/cases/models.py`. If you change one,
change the other.

In browser-only dev mode (`npm run dev`, no PyWebView host), these
calls should be mocked against `frontend/src/lib/mockData.ts` so the UI
stays explorable without the Python backend running — this mocking
layer isn't wired yet (Phase 2).
