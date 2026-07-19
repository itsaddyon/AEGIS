import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck, ArrowLeft, XCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface PhoneCallScenario {
  id: string
  callerName: string
  callerTitle: string
  introText: string
  dialogueTree: {
    text: string
    options: {
      text: string
      nextKey: string
      correct?: boolean
      fail?: boolean
      feedback?: string
    }[]
  }[]
  finalFeedback: string
  consequence: string
}

const CALL_SCENARIOS: PhoneCallScenario[] = [
  {
    id: 'call1',
    callerName: 'Dave from IT Support',
    callerTitle: 'Global Network Operations Center',
    introText: 'Your phone rings. The caller ID displays "IT SUPPORT". You answer.',
    dialogueTree: [
      {
        text: 'Hello, this is Dave from the IT Helpdesk. We are conducting an urgent security audit of active workstations on your floor. I need to verify your LDAP password to ensure your account is not disabled in the upcoming database migration. Can you read it to me?',
        options: [
          { text: 'Verify credentials: "Sure, my password is password123."', nextKey: 'fail1', fail: true, feedback: 'You shared your credentials directly over the phone to an unverified caller.' },
          { text: 'Refuse: "I cannot share my password over the phone. You should already have database access."', nextKey: 'step2' },
          { text: 'Challenge identity: "Please send me an official ticket confirmation or email from your corporate address."', nextKey: 'step1b' }
        ]
      },
      {
        text: 'I cannot email you right now because your account is pending suspension, which is why I am calling. If you do not give me the password, you will be locked out of the company intranet within 5 minutes. Just read it to me quickly.',
        options: [
          { text: 'Yield to pressure: "Okay, it is password123. Just please do not lock my account."', nextKey: 'fail2', fail: true, feedback: 'You gave in to urgency pressure and leaked your LDAP credentials.' },
          { text: 'Firm refusal: "I will call the official IT Helpdesk number listed on the intranet directory to resolve this. Goodbye."', nextKey: 'success', correct: true }
        ]
      }
    ],
    finalFeedback: 'Never share corporate passwords, tokens, or security configurations over a phone call, regardless of the caller ID. Spoofing caller ID is trivial.',
    consequence: 'The attacker immediately uses your credentials to log in to the corporate VPN, compromise your local machine, and install network sniffers.'
  },
  {
    id: 'call2',
    callerName: 'Executive Office (CEO)',
    callerTitle: 'Urgent Wire Request',
    introText: 'You receive a call on your mobile phone from the CEO\'s office. A voice that sounds exactly like your CEO speaks.',
    dialogueTree: [
      {
        text: 'Hey, I am at the airport about to board a flight to London. We have an urgent acquisition deal closing in 30 minutes, and the finance team is not replying. I need you to initiate a wire transfer of $15,000 to the vendor details I texted you. Can you do this right away?',
        options: [
          { text: 'Accept request: "Yes, I will contact finance or initiate the transfer immediately."', nextKey: 'fail1', fail: true, feedback: 'You agreed to transfer large sums of money based purely on a voice call (often backed by AI deepfake cloning).' },
          { text: 'Double check: "I will need to verify this via our internal Slack messenger and confirm with the CFO first."', nextKey: 'step2' }
        ]
      },
      {
        text: 'I told you, I am boarding a flight! I won\'t have signal. If we miss this window, the deal is dead and it will be your responsibility. Just authorize the payment, I will back you up when I land.',
        options: [
          { text: 'Submit to fear: "Okay, I will do it now."', nextKey: 'fail2', fail: true, feedback: 'You fell for senior authority pressure. CFO verification is mandatory for all wire payments.' },
          { text: 'Hold the line: "Company policy requires multi-channel approval for any transaction over $5,000. I cannot execute this without standard compliance."', nextKey: 'success', correct: true }
        ]
      }
    ],
    finalFeedback: 'This is a Vishing attack utilizing voice-cloning technology (AI Deepfakes) impersonating senior executives to bypass financial controls.',
    consequence: 'The $15,000 is sent to a mule account, immediately withdrawn, and the company suffers an unrecoverable financial loss.'
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function PhoneCallSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [dialogueLog, setDialogueLog] = useState<string[]>([])
  const [verdict, setVerdict] = useState<{ correct: boolean; feedback: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const scenario = CALL_SCENARIOS[index]
  const currentStep = scenario?.dialogueTree[currentStepIdx]

  function selectOption(opt: any) {
    const newLog = [...dialogueLog, `You: ${opt.text}`]

    if (opt.fail) {
      setDialogueLog(newLog)
      setVerdict({ correct: false, feedback: opt.feedback })
      return
    }

    if (opt.correct) {
      setDialogueLog(newLog)
      setVerdict({ correct: true, feedback: 'Excellent deflection of vishing vectors!' })
      setCorrectCount((c) => c + 1)
      return
    }

    // Advance dialogue step
    if (opt.nextKey === 'step2') {
      const nextStepIdx = 1
      setCurrentStepIdx(nextStepIdx)
      setDialogueLog([...newLog, `${scenario.callerName}: ${scenario.dialogueTree[nextStepIdx].text}`])
    } else if (opt.nextKey === 'step1b') {
      // Small branch response
      setDialogueLog([...newLog, `${scenario.callerName}: I told you, your account is locked so I can't mail you. Please just verify.`])
      // Remain on step 1 dialog options, just filter out the challenge option
    }
  }

  async function nextScenario() {
    setVerdict(null)
    setDialogueLog([])
    setCurrentStepIdx(0)
    if (index + 1 < CALL_SCENARIOS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('phone-call', correctCount, CALL_SCENARIOS.length)
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
            <Phone size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Phone Call (Vishing) Simulator</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Voice phishing and executive impersonation."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Social engineers use caller ID spoofing and voice cloning to trick employees into resetting passwords,
              leaking system details, or executing bank transfers.
              Listen to the caller, navigate the conversation, and stand firm against pressure.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{CALL_SCENARIOS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Calls</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">50</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Dialogue</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Tree</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => {
              setPhase('simulation')
              setDialogueLog([`${CALL_SCENARIOS[0].callerName}: ${CALL_SCENARIOS[0].dialogueTree[0].text}`])
            }}>
              Connect Call <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / CALL_SCENARIOS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Vishing Lab Cleared</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{CALL_SCENARIOS.length}</span>
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

  // ─── SIMULATION ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">VISHING VOICE LAB</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Call {index + 1} of {CALL_SCENARIOS.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Telephone Call UI Screen */}
        <div className="border border-white/10 bg-[#0B0C0E] rounded-lg p-5 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
          {/* Header */}
          <div className="text-center mt-4">
            <div className="w-16 h-16 rounded-full bg-teal/20 mx-auto flex items-center justify-center text-teal animate-pulse">
              <Phone size={24} />
            </div>
            <div className="mt-3 font-semibold text-sm text-[#EFEDE6]">{scenario.callerName}</div>
            <div className="text-[10px] font-mono text-teal/60">{scenario.callerTitle}</div>
            <div className="mt-1 text-[9px] font-mono text-slate-light/60">CALL ACTIVE · Spoken via Audio Stream</div>
          </div>

          {/* Transcript Log */}
          <div className="mt-6 flex-1 bg-white/[0.02] border border-white/5 rounded-md p-3 overflow-y-auto text-[11px] leading-relaxed space-y-2 max-h-[160px]">
            {dialogueLog.map((line, li) => {
              const isUser = line.startsWith('You:')
              return (
                <div key={li} className={isUser ? 'text-teal' : 'text-slate-light'}>
                  {line}
                </div>
              )
            })}
          </div>

          {/* Equalizer animation */}
          <div className="h-6 flex items-center justify-center gap-1 mt-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-teal/60 rounded-full animate-bounce"
                style={{
                  height: `${Math.random() * 20 + 8}px`,
                  animationDelay: `${i * 150}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Reply Selection Panel */}
        <div className="border border-white/10 bg-[#1E1F22] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">Intro context</div>
            <p className="text-xs text-slate-light leading-relaxed mb-4">{scenario.introText}</p>

            {!verdict && currentStep && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">Select Response</div>
                {currentStep.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => selectOption(opt)}
                    className="w-full flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5 px-4 py-3 text-left text-xs transition-all duration-200 cursor-pointer"
                  >
                    <span className="font-mono text-teal mt-0.5">▸</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verdict/Feedback Overlay */}
          {verdict && (
            <div className={`p-4 rounded-lg border mt-4 ${verdict.correct ? 'border-teal/20 bg-teal/5 text-teal' : 'border-danger/20 bg-danger/5 text-danger'}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {verdict.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {verdict.correct ? 'Deflected!' : 'Compromised!'}
              </div>
              <p className="mt-2 text-[11px] text-[#EFEDE6] font-semibold">{verdict.feedback}</p>
              <p className="mt-2 text-[11px] text-slate-light leading-relaxed">
                <strong className="text-[#EFEDE6]">IT Analysis: </strong>{scenario.finalFeedback}
              </p>
              {!verdict.correct && (
                <p className="mt-1.5 text-[11px] text-slate-light leading-relaxed">
                  <strong className="text-danger">Consequence: </strong>{scenario.consequence}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={nextScenario}>
                {index + 1 < CALL_SCENARIOS.length ? 'Next Call' : 'Finish Call Lab'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
