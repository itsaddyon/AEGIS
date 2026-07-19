import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ShieldAlert, ShieldCheck, ChevronRight, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { INBOX_EMAILS, type SimEmail } from '@/data/emails'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

type Phase = 'briefing' | 'simulation' | 'finished'
type Verdict = { correct: boolean; email: SimEmail }

export function FakeInboxSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const email = INBOX_EMAILS[index]

  function answer(choseIsPhishing: boolean) {
    const correct = choseIsPhishing === email.isPhishing
    if (correct) setCorrectCount((c) => c + 1)
    setVerdict({ correct, email })
  }

  async function next() {
    setVerdict(null)
    if (index + 1 < INBOX_EMAILS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('fake-inbox', correctCount, INBOX_EMAILS.length)
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
            <Mail size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Fake Email Inbox</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Trust nothing. Verify everything."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Your inbox has been compromised with a mix of legitimate emails and carefully crafted phishing attacks.
              Review each email and decide: is it <strong className="text-danger">phishing</strong> or <strong className="text-teal">legitimate</strong>?
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{INBOX_EMAILS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Emails</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-danger">{INBOX_EMAILS.filter(e => e.isPhishing).length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Are Traps</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">60</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Open Inbox <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / INBOX_EMAILS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Inbox Cleared</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{INBOX_EMAILS.length}</span>
            <span className="text-sm text-slate-light ml-2">({pct}%)</span>
          </div>
          {finalXp != null && (
            <p className="mt-3 text-sm text-teal font-mono">+{finalXp} XP earned</p>
          )}
          <Button className="mt-6" onClick={() => navigate('/practice-lab')}>
            <ArrowLeft size={14} /> Back to Practice Lab
          </Button>
        </div>
      </div>
    )
  }

  // ─── SIMULATION ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">INBOX</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-light">
            {index + 1} / {INBOX_EMAILS.length}
          </span>
          {/* Progress dots */}
          <div className="flex gap-1">
            {INBOX_EMAILS.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-teal' : i < index ? 'bg-teal/40' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Email card — rendered as an email client */}
      <div className="border border-white/10 bg-[#1E1F22]/80 rounded-lg overflow-hidden">
        {/* Email header */}
        <div className="border-b border-white/5 px-5 py-3 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-bold text-xs">
                {email.from.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#EFEDE6]">{email.from}</div>
                <div className="text-[11px] text-slate-light font-mono">&lt;{email.fromAddress}&gt;</div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">{email.subject}</div>
        </div>

        {/* Email body */}
        <div className="px-5 py-4 text-sm text-slate-light leading-relaxed whitespace-pre-line min-h-[120px]">
          {email.body}
        </div>

        {/* Action buttons */}
        {!verdict && (
          <div className="border-t border-white/5 px-5 py-4 flex gap-3">
            <button
              onClick={() => answer(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition cursor-pointer"
            >
              <AlertTriangle size={16} /> Report as Phishing
            </button>
            <button
              onClick={() => answer(false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 text-sm font-medium text-teal hover:bg-teal/10 transition cursor-pointer"
            >
              <CheckCircle2 size={16} /> Mark as Legitimate
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

            {email.isPhishing ? (
              <>
                <p className="mt-2 text-xs text-slate-light">
                  <strong className="text-[#EFEDE6]">The tell: </strong>{email.tell}
                </p>
                {!verdict.correct && email.consequence && (
                  <p className="mt-2 text-xs text-slate-light">
                    <strong className="text-danger">Real-world impact: </strong>{email.consequence}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-light">
                This email was legitimate — the sender domain, tone, and content were all consistent and trustworthy.
              </p>
            )}

            <Button className="mt-4 w-full" onClick={next}>
              {index + 1 < INBOX_EMAILS.length ? (
                <>Next Email <ChevronRight size={14} /></>
              ) : (
                <>See Results</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
