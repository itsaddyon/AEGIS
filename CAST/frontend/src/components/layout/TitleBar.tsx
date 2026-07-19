import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const VERSION = 'v0.1.0'

/** Slim custom title bar — desktop-native feel, not a browser chrome. */
export function TitleBar() {
  const profile = useAppStore((s) => s.profile)
  const setTheme = useAppStore((s) => s.setTheme)
  const isDark = (profile?.theme ?? 'dark') === 'dark'

  return (
    <div className="flex h-11 items-center justify-between border-b border-[var(--border)] px-4 select-none">
      <div className="text-sm text-muted">
        CAST <span className="opacity-60">— Cyber Awareness Simulation Trainer</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>{VERSION}</span>
        <button
          className="focus-ring rounded-lg p-1.5 hover:bg-white/5"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </div>
  )
}
