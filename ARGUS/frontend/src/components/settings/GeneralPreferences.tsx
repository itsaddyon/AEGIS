import { Monitor, Bell, Trash2 } from 'lucide-react'

export function GeneralPreferences() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1">General Preferences</h2>
        <p className="text-sm text-slate-light">Manage UI themes, notifications, and data retention policies.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Theme Toggle */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-muted dark:bg-charcoal flex items-center justify-center">
              <Monitor className="w-5 h-5 text-teal" />
            </div>
            <div>
              <div className="font-semibold text-sm">Dark Mode</div>
              <div className="text-xs text-slate-light">Switch between light and dark UI themes</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded bg-teal/10 text-teal text-xs font-semibold border border-teal/20">Enabled</button>
            <button className="px-3 py-1.5 rounded bg-surface-muted dark:bg-charcoal text-slate text-xs border border-transparent">Light</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-muted dark:bg-charcoal flex items-center justify-center">
              <Bell className="w-5 h-5 text-olive" />
            </div>
            <div>
              <div className="font-semibold text-sm">Critical Alerts Audio</div>
              <div className="text-xs text-slate-light">Play a sound when a high or critical threat is detected</div>
            </div>
          </div>
          <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-teal transition-colors">
            <span className="translate-x-5 inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" />
          </button>
        </div>

        {/* Data Retention */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-muted dark:bg-charcoal flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="font-semibold text-sm">Auto-Purge Timeline</div>
              <div className="text-xs text-slate-light">Automatically delete benign packets older than 24 hours</div>
            </div>
          </div>
          <select className="bg-surface-muted dark:bg-charcoal border border-border dark:border-border-dark rounded px-2 py-1 text-xs text-slate outline-none">
            <option>24 Hours</option>
            <option>7 Days</option>
            <option>30 Days</option>
            <option>Never</option>
          </select>
        </div>
      </div>
    </div>
  )
}
