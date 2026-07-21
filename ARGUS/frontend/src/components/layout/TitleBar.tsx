import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

// Native-feeling custom title bar for the PyWebView shell.
export function TitleBar() {
  const [isDark, setIsDark] = useState(true)

  function toggleTheme() {
    document.documentElement.classList.toggle('dark')
    setIsDark((d) => !d)
  }

  return (
    <div className="pywebview-drag-region h-9 flex items-center justify-between px-3 bg-surface
                     dark:bg-charcoal border-b border-border dark:border-border-dark
                     select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="text-xs font-medium text-slate">ARGUS — Threat Investigation Console</div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-surface-muted dark:hover:bg-graphite">
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
