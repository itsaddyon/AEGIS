import { NavLink } from 'react-router-dom'
import {
  ShieldCheck, Activity, FolderSearch,
  FileBarChart, History, Settings, Info,
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  comingSoon?: boolean
}

const primaryNav: NavItem[] = [
  { label: 'Security Overview', to: '/', icon: ShieldCheck },
  { label: 'Live Monitoring', to: '/monitoring', icon: Activity },
  { label: 'Case Files', to: '/cases', icon: FolderSearch },
  { label: 'Reports', to: '/reports', icon: FileBarChart },
  { label: 'Incident History', to: '/history', icon: History },
]

const bottomNav: NavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'About', to: '/about', icon: Info },
]

export function Sidebar() {
  return (
    <aside className="w-64 h-full flex flex-col bg-surface dark:bg-charcoal
                       border-r border-border dark:border-border-dark py-4 px-3">
      <div className="flex items-center gap-3 px-2 mb-6">
        <img src="/logo.png" alt="ARGUS Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
        <div>
          <div className="font-display font-semibold text-sm leading-tight text-charcoal dark:text-white tracking-wide">ARGUS</div>
          <div className="text-[10px] text-teal font-mono tracking-widest uppercase">AEGIS Suite</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 cursor-pointer font-mono tracking-wide',
              isActive
                ? 'bg-teal/10 text-teal dark:text-teal font-medium'
                : 'text-slate dark:text-slate-light hover:bg-surface-muted dark:hover:bg-graphite'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-1 pt-2 border-t border-border dark:border-border-dark">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 cursor-pointer font-mono tracking-wide',
              isActive
                ? 'bg-teal/10 text-teal dark:text-teal font-medium'
                : 'text-slate dark:text-slate-light hover:bg-surface-muted dark:hover:bg-graphite'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
