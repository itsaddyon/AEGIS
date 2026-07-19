import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Monitor, Unlock, Save } from 'lucide-react'

export function Settings() {
  const profile = useAppStore((s) => s.profile)
  const setTheme = useAppStore((s) => s.setTheme)
  const setDisplayName = useAppStore((s) => s.setDisplayName)
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [name, setName] = useState(profile?.display_name ?? '')
  const [devBypass, setDevBypass] = useState(
    typeof window !== 'undefined' && localStorage.getItem('cast_dev_bypass') === 'true'
  )

  async function toggleDevBypass() {
    const nextVal = !devBypass
    
    // If trying to enable, require passcode
    if (nextVal) {
      const code = window.prompt("Enter Developer Override Code to unlock progression:")
      if (code !== "AEGIS-MASTER") {
        window.alert("Invalid override code. Progression remains locked.")
        return
      }
    }

    setDevBypass(nextVal)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cast_dev_bypass', nextVal ? 'true' : 'false')
    }
    await refreshAll()
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-display font-semibold mb-1">Settings</h1>
        <p className="text-sm text-slate-light">Manage your CAST profile, UI themes, and developer options.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Profile Settings */}
        <div className="glass-panel p-6 rounded-lg flex flex-col gap-4 border-white/5">
          <div className="text-xs uppercase tracking-widest font-mono text-teal font-bold">Profile Identity</div>
          <div className="flex items-center gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-surface-muted dark:bg-[#141517] border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-sm outline-none text-charcoal dark:text-[#EFEDE6] font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]"
              placeholder="Enter display name..."
            />
            <button 
              onClick={() => setDisplayName(name)}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal/10 hover:bg-teal/20 text-teal rounded-lg text-sm font-bold font-mono tracking-wide border border-teal/20 transition-colors"
            >
              <Save size={16} /> Save Identity
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="glass-panel p-6 rounded-lg flex items-center justify-between border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-muted dark:bg-[#141517] flex items-center justify-center border border-border dark:border-border-dark">
              <Monitor className="w-6 h-6 text-teal" />
            </div>
            <div>
              <div className="font-semibold text-sm text-charcoal dark:text-[#EFEDE6]">Application Theme</div>
              <div className="text-xs text-slate-light mt-0.5">Switch between light and dark UI themes</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg bg-surface-muted dark:bg-[#141517] border border-border dark:border-border-dark">
            <button 
              onClick={() => setTheme('light')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${profile?.theme === 'light' ? 'bg-white dark:bg-charcoal text-teal shadow-sm' : 'text-slate-light hover:text-slate'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${profile?.theme === 'dark' ? 'bg-white dark:bg-charcoal text-teal shadow-sm' : 'text-slate-light hover:text-slate'}`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Developer Bypass */}
        <div className={`glass-panel p-6 rounded-lg border-2 transition-all duration-300 ${devBypass ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)]' : 'border-white/5'}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${devBypass ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#141517] border-white/5'}`}>
                  <Unlock className={`w-6 h-6 ${devBypass ? 'text-amber-500 animate-pulse' : 'text-slate/40'}`} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${devBypass ? 'text-amber-500' : 'text-charcoal dark:text-[#EFEDE6]'}`}>Developer Bypass Protocol</div>
                  <div className="text-xs text-slate-light mt-0.5 max-w-xl leading-relaxed">
                    Instantly unlock all sequenced content (Missions & Labs) without requiring prerequisite XP. Warning: This bypasses intended educational progression.
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleDevBypass}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${devBypass ? 'bg-amber-500 border-amber-400' : 'bg-surface-muted dark:bg-charcoal border-border dark:border-border-dark'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${devBypass ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
