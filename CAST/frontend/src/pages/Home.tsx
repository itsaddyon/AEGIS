import { Link } from 'react-router-dom'
import { Flame, ShieldCheck, Zap, ArrowRight, BookOpen, FlaskConical, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAppStore } from '@/store/useAppStore'
import { xpProgressWithinLevel } from '@/utils/xp'

function StatCard({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 transition-all duration-300 ${accent ? 'border-teal/20 bg-teal/5 glow-teal' : 'border-white/10 bg-white/5'}`}>
      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-light uppercase tracking-wider">
        <Icon size={12} className={accent ? 'text-teal' : ''} /> {label}
      </div>
      <div className={`mt-2 text-2xl font-bold font-mono ${accent ? 'text-teal' : 'text-[#EFEDE6]'}`}>
        {value}
      </div>
    </div>
  )
}

export function Home() {
  const profile = useAppStore((s) => s.profile)
  const missions = useAppStore((s) => s.missions)

  const nextMission = missions.find((m) => m.status === 'available' || m.status === 'in_progress')
  const completedCount = missions.filter((m) => m.status === 'completed').length
  const xpProgress = profile ? xpProgressWithinLevel(profile.xp) : { current: 0, needed: 1, pct: 0 }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
            WELCOME BACK, {(profile?.display_name ?? 'LEARNER').toUpperCase()}
          </h1>
          <p className="mt-1 text-xs font-mono text-slate-light tracking-wide">
            Keep your Cyber Safety Score climbing.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3 py-1.5 font-mono text-[10px] text-teal uppercase tracking-widest">
          <Award size={12} />
          <span>{profile?.cyber_rank ?? 'Novice'}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <StatCard icon={Flame} label="Streak" value={`${profile?.streak_days ?? 0}d`} />
        <StatCard icon={ShieldCheck} label="Safety Score" value={profile?.safety_score ?? 0} accent />
        <StatCard icon={Zap} label="Level" value={`Lv. ${profile?.level ?? 1}`} />
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-light uppercase tracking-wider">
            <span>XP Progress</span>
            <span className="text-teal">{profile?.xp ?? 0} XP</span>
          </div>
          <div className="mt-3"><ProgressBar pct={xpProgress.pct} /></div>
          <div className="mt-1 text-[10px] font-mono text-slate-light">
            {xpProgress.current} / {xpProgress.needed} to next level
          </div>
        </div>
      </div>

      {/* Continue Learning + Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {/* Main CTA */}
        <div className="col-span-2 relative border border-teal/10 bg-[#1E1F22]/60 backdrop-blur-md rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(63,125,119,0.06)_0%,transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-mono text-teal/50 uppercase tracking-wider">
              <BookOpen size={12} /> Continue Training
            </div>
            {nextMission ? (
              <>
                <div className="mt-3 text-xl font-bold text-[#EFEDE6]">{nextMission.title}</div>
                <p className="mt-1 text-xs text-slate-light">
                  Mission {nextMission.order_index} of {missions.length} · {nextMission.xp_reward} XP reward
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-light">
                  {completedCount} of {missions.length} missions completed
                </div>
                <Link to={`/learning-path/${nextMission.id}`}>
                  <Button className="mt-4">
                    {nextMission.status === 'in_progress' ? 'Resume' : 'Start'} Mission <ArrowRight size={14} />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="mt-3 text-xl font-bold text-teal">All Missions Complete</div>
                <p className="mt-1 text-xs text-slate-light">Excellent work, operative. Head to the Practice Lab to keep your skills sharp.</p>
                <Link to="/practice-lab">
                  <Button className="mt-4">Practice Lab <ArrowRight size={14} /></Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <Link to="/practice-lab" className="flex-1">
            <div className="h-full rounded-lg border border-white/10 bg-white/5 p-4 hover:border-teal/20 hover:bg-teal/5 transition-all cursor-pointer">
              <FlaskConical size={18} className="text-teal" />
              <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">Practice Lab</div>
              <div className="mt-0.5 text-[11px] text-slate-light">Test your skills with interactive simulations</div>
            </div>
          </Link>
          <Link to="/achievements" className="flex-1">
            <div className="h-full rounded-lg border border-white/10 bg-white/5 p-4 hover:border-teal/20 hover:bg-teal/5 transition-all cursor-pointer">
              <Award size={18} className="text-teal" />
              <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">Achievements</div>
              <div className="mt-0.5 text-[11px] text-slate-light">Track your badges and milestones</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
