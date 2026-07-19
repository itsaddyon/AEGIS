import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import {
  Mail, Globe, QrCode, KeyRound, Phone, Usb, MessageSquare, AlertTriangle, ShieldCheck, Lock, CheckCircle
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  email: Mail,
  web: Globe,
  qr: QrCode,
  otp: KeyRound,
  call: Phone,
  usb: Usb,
  social: MessageSquare,
  browser: AlertTriangle,
  password: ShieldCheck,
}

export function PracticeLab() {
  const simulations = useAppStore((s) => s.simulations)
  const refreshAll = useAppStore((s) => s.refreshAll)

  useEffect(() => {
    refreshAll()
  }, [])

  // Order defined in database
  const orderList = ['fake-inbox', 'real-vs-fake-site', 'qr-scanner', 'otp-scam', 'phone-call', 'usb-attack', 'social-chat', 'browser-warning', 'password-lab']

  // Sort them to be safe
  const sortedSims = [...simulations].sort((a, b) => {
    return orderList.indexOf(a.id) - orderList.indexOf(b.id)
  })

  const devBypass = typeof window !== 'undefined' && localStorage.getItem('cast_dev_bypass') === 'true'

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
            PRACTICE LAB
          </h1>
          <p className="mt-1 text-xs font-mono text-slate-light tracking-wide">
            Interactive target simulations. Complete one to unlock the next.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSims.map((sim, index) => {
          // The first simulation is always unlocked.
          // Subsequent ones are unlocked only if the previous simulation has attempt_count > 0.
          const isUnlocked = devBypass || index === 0 || (sortedSims[index - 1]?.attempt_count ?? 0) > 0
          const hasAttempted = (sim.attempt_count ?? 0) > 0
          const Icon = ICON_MAP[sim.category] || Globe

          const cardContent = (
            <Card className={`relative h-full overflow-hidden transition-all duration-300 border ${
              isUnlocked 
                ? 'border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5 cursor-pointer shadow-[0_0_15px_rgba(63,125,119,0.05)]' 
                : 'border-white/5 bg-[#141517]/50 opacity-40 cursor-not-allowed'
            }`}>
              {/* Top Accent Icon & Badges */}
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-md ${isUnlocked ? 'bg-teal/15 text-teal shadow-[0_0_10px_rgba(63,125,119,0.15)]' : 'bg-white/5 text-slate-light'}`}>
                  <Icon size={16} />
                </div>
                <div className="flex gap-1.5">
                  <Badge>{sim.difficulty}</Badge>
                  {hasAttempted && (
                    <Badge tone="accent" className="flex items-center gap-1">
                      <CheckCircle size={10} /> Cleared
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title & XP */}
              <div className="mt-4">
                <div className={`font-semibold text-sm leading-snug ${isUnlocked ? 'text-[#EFEDE6]' : 'text-slate-light'}`}>
                  {sim.title}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-teal/60">
                  <span>{sim.xp_reward} XP REWARD</span>
                </div>
              </div>

              {/* Locked HUD element */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-[#0B0C0E]/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                  <Lock size={18} className="text-slate-light/60" />
                  <span className="font-mono text-[9px] text-slate-light/60 uppercase tracking-widest">Locked</span>
                </div>
              )}
            </Card>
          )

          return isUnlocked ? (
            <Link key={sim.id} to={`/practice-lab/${sim.id}`} className="block">
              {cardContent}
            </Link>
          ) : (
            <div key={sim.id} className="block">
              {cardContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
