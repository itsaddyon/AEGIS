import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, ChevronRight, Zap } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { MissionStatus } from '@/types'

function statusColor(status: MissionStatus) {
  if (status === 'completed') return 'border-teal bg-teal/10 text-teal'
  if (status === 'available' || status === 'in_progress') return 'border-teal/50 bg-teal/5 text-[#EFEDE6]'
  return 'border-white/10 bg-white/5 text-slate'
}

function statusGlow(status: MissionStatus) {
  if (status === 'completed') return 'shadow-[0_0_20px_rgba(63,125,119,0.25)]'
  if (status === 'available' || status === 'in_progress') return 'shadow-[0_0_15px_rgba(63,125,119,0.15)] animate-pulse-glow'
  return ''
}

export function LearningPath() {
  const missions = useAppStore((s) => s.missions)
  const completedCount = missions.filter((m) => m.status === 'completed').length
  const devBypass = typeof window !== 'undefined' && localStorage.getItem('cast_dev_bypass') === 'true'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
            MISSION MAP
          </h1>
          <p className="mt-1 text-xs font-mono text-slate-light tracking-wide">
            {completedCount} of {missions.length} missions complete
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-teal uppercase tracking-widest">
          <Zap size={12} />
          <span>{completedCount === missions.length ? 'ALL CLEAR' : 'IN PROGRESS'}</span>
        </div>
      </div>

      <div className="mt-8 relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-teal/40 via-teal/20 to-white/5" />

        <div className="flex flex-col gap-1">
          {(() => {
            let prevCompleted = true;
            return missions.map((m, index) => {
              const isActuallyCompleted = m.status === 'completed';
              
              // A mission is locked if the previous one wasn't completed (unless devBypass is on)
              // We also allow the very first mission to be unlocked unconditionally.
              const isLocked = !devBypass && index > 0 && !prevCompleted && !isActuallyCompleted;
              
              // Use string type assertion to prevent TS strict literal complaints, 
              // or just keep it simple since we derived it manually.
              const displayedStatus = isActuallyCompleted ? 'completed' : isLocked ? 'locked' : 'available';
              
              prevCompleted = isActuallyCompleted;

              const active = displayedStatus === 'available';
              const locked = displayedStatus === 'locked';

              const node = (
                <div className={`group relative flex items-center gap-4 rounded-lg border p-4 pl-14 transition-all duration-300 ${statusColor(displayedStatus)} ${statusGlow(displayedStatus)} ${!locked ? 'hover:brightness-125 cursor-pointer' : 'cursor-not-allowed overflow-hidden'}`}>
                  {/* Hover Overlay for Locked Missions */}
                  {locked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B0C0E]/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 text-xs font-mono font-bold text-teal uppercase tracking-widest shadow-xl">
                        <Lock size={14} /> Complete previous mission to unlock
                      </div>
                    </div>
                  )}

                  {/* Node dot on the timeline */}
                  <div className={`absolute left-[18px] w-4 h-4 rounded-full border-2 z-10 ${
                    isActuallyCompleted ? 'border-teal bg-teal' : active ? 'border-teal bg-teal/30 animate-pulse' : 'border-white/20 bg-[#1E1F22]'
                  }`}>
                    {isActuallyCompleted && <CheckCircle2 size={12} className="text-[#0B0C0E] absolute -top-px -left-px" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-wider text-teal/60 uppercase">
                        MISSION {m.order_index}
                      </span>
                      {isActuallyCompleted && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal/20 text-teal font-bold tracking-wider">
                          COMPLETE
                        </span>
                      )}
                      {active && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal/10 text-teal/80 font-bold tracking-wider">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-sm">{m.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-light">
                      <Zap size={10} /> {m.xp_reward} XP
                      {m.quiz_score != null && (
                        <span className="ml-2">Score: {m.quiz_score}%</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow / Lock */}
                  {locked ? (
                    <Lock size={16} className="text-slate/50 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-teal/60 shrink-0" />
                  )}
                </div>
              )

              return locked ? (
                <div key={m.id}>{node}</div>
              ) : (
                <Link key={m.id} to={`/learning-path/${m.id}`}>{node}</Link>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
