import { Moon, Sun, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    pywebview?: {
      api?: {
        get_user_identity?: () => Promise<string>
        list_cases?: (status?: string | null) => Promise<string>
        get_case?: (case_id: string) => Promise<string | null>
        update_case_status?: (case_id: string, status: string) => Promise<boolean>
        simulate_attack?: () => Promise<boolean>
      }
    }
  }
}

// Native-feeling custom title bar for the PyWebView shell.
// Window controls (minimize, maximize, close) are handled by the OS frame.
export function TitleBar() {
  const [isDark, setIsDark] = useState(true)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    function fetchIdentity() {
      if (window.pywebview?.api?.get_user_identity) {
        window.pywebview.api.get_user_identity().then((raw) => {
          if (cancelled) return
          try {
            const parsed = JSON.parse(raw)
            setUsername(parsed.username || null)
          } catch {
            setUsername(null)
          }
        }).catch(() => setUsername(null))
      } else {
        setTimeout(fetchIdentity, 300)
      }
    }
    fetchIdentity()
    return () => { cancelled = true }
  }, [])

  function toggleTheme() {
    document.documentElement.classList.toggle('dark')
    setIsDark((d) => !d)
  }

  return (
    <div className="pywebview-drag-region h-9 flex items-center justify-between px-3 bg-[#0a0c10] border-b border-border/20 select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-xs font-medium text-slate-light truncate">ARGUS — Threat Investigation Console</div>
        {username && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-slate-light shrink-0">
            <UserCircle className="w-3 h-3" />
            <span>Hello, {username}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-[#121622] text-slate-light" title="Toggle Theme">
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
