import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, ShieldAlert, ShieldCheck, Lock, Unlock, ChevronRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SITE_ROUNDS, type SiteRound } from '@/data/websites'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

type Phase = 'briefing' | 'simulation' | 'finished'
type Verdict = { correct: boolean; round: SiteRound }

export function FakeWebsiteSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const round = SITE_ROUNDS[index]

  function answer(choseIsFake: boolean) {
    const correct = choseIsFake === round.isFake
    if (correct) setCorrectCount((c) => c + 1)
    setVerdict({ correct, round })
  }

  async function next() {
    setVerdict(null)
    if (index + 1 < SITE_ROUNDS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('real-vs-fake-site', correctCount, SITE_ROUNDS.length)
      setFinalXp(result.xpEarned ?? null)
      await refreshAll()
      setPhase('finished')
    }
  }

  // ─── BRIEFING ────────────────────────────────────────
  if (phase === 'briefing') {
    return (
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate('/practice-lab')} className="flex items-center gap-1 text-xs font-mono text-slate-light hover:text-teal transition mb-6 cursor-pointer">
          <ArrowLeft size={14} /> PRACTICE LAB
        </button>

        <div className="relative border border-teal/10 bg-[#1E1F22]/60 backdrop-blur-md rounded-lg p-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(63,125,119,0.08)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 text-center">
            <Globe size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Real vs Fake Website</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"The URL never lies."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              You'll be shown website login pages with their address bar. Some are real, some are
              pixel-perfect clones on fake domains. Your job: read the URL and decide if the site is
              <strong className="text-teal"> real</strong> or <strong className="text-danger">fake</strong>.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{SITE_ROUNDS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Sites</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-danger">{SITE_ROUNDS.filter(s => s.isFake).length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Are Fakes</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">60</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Start Browsing <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / SITE_ROUNDS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Round Complete</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{SITE_ROUNDS.length}</span>
            <span className="text-sm text-slate-light ml-2">({pct}%)</span>
          </div>
          {finalXp != null && <p className="mt-3 text-sm text-teal font-mono">+{finalXp} XP earned</p>}
          <Button className="mt-6" onClick={() => navigate('/practice-lab')}>
            <ArrowLeft size={14} /> Back to Practice Lab
          </Button>
        </div>
      </div>
    )
  }

  // ─── SIMULATION — Browser Chrome UI ──────────────────
  const isHttps = round.url.startsWith('https://')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">BROWSER</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-light">{index + 1} / {SITE_ROUNDS.length}</span>
          <div className="flex gap-1">
            {SITE_ROUNDS.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-teal' : i < index ? 'bg-teal/40' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Simulated browser window */}
      <div className="border border-white/10 bg-[#1E1F22]/80 rounded-lg overflow-hidden">
        {/* Browser tab bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#141517] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-danger/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-teal/60" />
          </div>
          <div className="flex-1 ml-2 rounded bg-white/5 px-3 py-1.5 text-xs font-mono flex items-center gap-2">
            {isHttps ? (
              <Lock size={11} className="text-teal shrink-0" />
            ) : (
              <Unlock size={11} className="text-warning shrink-0" />
            )}
            <span className="text-slate-light truncate">{round.url}</span>
          </div>
        </div>

        {/* Page content preview */}
        <div className="px-6 py-8 min-h-[160px] flex flex-col items-center justify-center text-center bg-[#1a1b1e]">
          <div className="text-lg font-bold text-[#EFEDE6]">{round.pageTitle || 'Sign In'}</div>
          <p className="mt-1 text-xs text-slate-light">{round.pageSubtitle || 'Enter your credentials to continue'}</p>
          <div className="mt-4 w-full max-w-xs space-y-2">
            <div className="h-9 rounded border border-white/10 bg-white/5 px-3 flex items-center text-xs text-slate/50">
              Email or username
            </div>
            <div className="h-9 rounded border border-white/10 bg-white/5 px-3 flex items-center text-xs text-slate/50">
              Password
            </div>
            <div className="h-9 rounded bg-teal/20 flex items-center justify-center text-xs font-medium text-teal">
              Sign In
            </div>
          </div>
        </div>

        {/* Judgment buttons */}
        {!verdict && (
          <div className="border-t border-white/5 px-5 py-4 flex gap-3">
            <button
              onClick={() => answer(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition cursor-pointer"
            >
              <AlertTriangle size={16} /> This is Fake
            </button>
            <button
              onClick={() => answer(false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 text-sm font-medium text-teal hover:bg-teal/10 transition cursor-pointer"
            >
              <CheckCircle2 size={16} /> This is Real
            </button>
          </div>
        )}

        {/* Verdict */}
        {verdict && (
          <div className={`border-t px-5 py-4 ${verdict.correct ? 'border-teal/20 bg-teal/5' : 'border-danger/20 bg-danger/5'}`}>
            <div className={`flex items-center gap-2 font-semibold text-sm ${verdict.correct ? 'text-teal' : 'text-danger'}`}>
              <ShieldAlert size={16} />
              {verdict.correct ? 'Correct!' : 'Not quite.'}
            </div>
            {round.isFake ? (
              <>
                <p className="mt-2 text-xs text-slate-light"><strong className="text-[#EFEDE6]">The tell: </strong>{round.tell}</p>
                {!verdict.correct && round.consequence && (
                  <p className="mt-2 text-xs text-slate-light"><strong className="text-danger">Real-world impact: </strong>{round.consequence}</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-light">This was a legitimate website — the domain and URL structure are correct and trusted.</p>
            )}
            <Button className="mt-4 w-full" onClick={next}>
              {index + 1 < SITE_ROUNDS.length ? <>Next Site <ChevronRight size={14} /></> : <>See Results</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
