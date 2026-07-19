import { NavLink } from 'react-router-dom'
import {
  Home, Map, FlaskConical, Trophy, Award, LineChart, Settings, Info,
  Radar, ShieldAlert, Lock, Zap,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/learning-path', label: 'Learning Path', icon: Map },
  { to: '/practice-lab', label: 'Practice Lab', icon: FlaskConical },
  { to: '/challenges', label: 'Challenges', icon: Trophy },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/progress', label: 'Progress', icon: LineChart },
]

// Other apps in the suite, launched as separate standalone processes.
const SUITE_ITEMS = [
  { to: '/network-monitor', label: 'Network Monitor', icon: Radar, locked: false },
  { to: '/threat-detection', label: 'Threat Detection', icon: ShieldAlert, locked: false },
]

const FOOTER_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

function NavRow({ to, label, icon: Icon, locked = false }: { to: string; label: string; icon: any; locked?: boolean }) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate/40 cursor-not-allowed">
        <Icon size={16} strokeWidth={1.75} />
        <span>{label}</span>
        <Lock size={12} className="ml-auto" strokeWidth={1.75} />
      </div>
    )
  }
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${isActive
          ? 'bg-teal/10 text-teal font-medium border-l-2 border-teal shadow-[inset_0_0_12px_rgba(63,125,119,0.08)]'
          : 'text-slate-light hover:bg-white/5 hover:text-[#EFEDE6] border-l-2 border-transparent'
        }`
      }
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const profile = useAppStore((s) => s.profile)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/5 bg-[#141517] px-3 py-4">
      {/* Logo */}
      <div className="mb-2 flex items-center gap-3 px-2">
        <img src="/logo.png" alt="CAST Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
        <span className="font-mono text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
          CAST
        </span>
      </div>

      {/* Profile mini-card */}
      {profile && (
        <div className="mx-1 mb-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-bold text-xs font-mono">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#EFEDE6] truncate">{profile.display_name}</div>
              <div className="text-[10px] font-mono text-teal/70">{profile.cyber_rank}</div>
            </div>
          </div>
          {/* XP bar */}
          <div className="mt-2 flex items-center gap-2">
            <Zap size={10} className="text-teal shrink-0" />
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal to-teal/60 transition-all duration-500"
                style={{ width: `${Math.min(((profile.xp % 200) / 200) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-light">{profile.xp} XP</span>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => <NavRow key={item.to} {...item} />)}
      </nav>

      <div className="mt-6 px-3 text-[10px] font-mono uppercase tracking-widest text-slate/40">AEGIS Ecosystem</div>
      <nav className="mt-1 flex flex-col gap-0.5">
        {SUITE_ITEMS.map((item) => <NavRow key={item.to} {...item} />)}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 pt-4 border-t border-white/5">
        {FOOTER_ITEMS.map((item) => <NavRow key={item.to} {...item} />)}
      </div>

      {/* Signature */}
      <div className="mt-3 px-2 text-[8px] font-mono text-slate/30 tracking-wider text-center uppercase">
        v1.0.0 · Adarsh Arya
      </div>
    </aside>
  )
}
