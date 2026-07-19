import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck, MessageSquare, PhoneCall, ChevronRight, ArrowLeft, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface OtpScenario {
  id: string
  service: string
  incomingSms: string
  agentMessage: string
  correctChoice: number // index of correct response
  choices: string[]
  tell: string
  consequence: string
}

const OTP_SCENARIOS: OtpScenario[] = [
  {
    id: 'otp1',
    service: 'Capital One Fraud Alert',
    incomingSms: 'Capital One Alert: Attempted charge of $849.00 at BestBuy. If not you, verify using security code 924810. NEVER share this code.',
    agentMessage: 'Hi, I\'m calling from Capital One Fraud Department. We blocked a $849 charge on your card. To confirm this block, please read me the 6-digit security code we just texted you.',
    choices: [
      'Read out the code: "Sure, the code is 924810."',
      'Refuse and say: "I will not share this code. I will hang up and call the number on the back of my card."',
      'Hang up and block the number immediately.'
    ],
    correctChoice: 1,
    tell: 'Real banks will NEVER ask you for an OTP sent to your phone. The OTP is a password to authorize an action (like logging in or processing a charge). Scammers call to intercept it after initiating the action themselves.',
    consequence: 'If you shared the code, the scammers would immediately authorize the $849 purchase using your hijacked session.'
  },
  {
    id: 'otp2',
    service: 'Google Account Password Recovery',
    incomingSms: 'G-748291 is your Google verification code.',
    agentMessage: 'Hey, I accidentally entered your phone number as my recovery option. Google sent a code to your phone. Can you please forward it to me so I can log in?',
    choices: [
      'Forward the code to the sender.',
      'Refuse and ignore the message.',
      'Report the account recovery code request as spam.'
    ],
    correctChoice: 2,
    tell: 'This is a Google Account takeover scam. The attacker already knows your email and triggered a password reset. They are claiming it was an "accident" to trick you into giving away your second authentication factor.',
    consequence: 'Sharing the code would allow the hacker to reset your password and completely lock you out of your Google account.'
  },
  {
    id: 'otp3',
    service: 'FedEx Delivery Update',
    incomingSms: 'FedEx: Your parcel requires signature authentication. OTP code: 110948. Do not share with drivers.',
    agentMessage: 'SMS: "Hi, I\'m your FedEx driver. I\'m outside your building but the gate code won\'t work. Please text me the 6-digit confirmation code you just received so I can bypass the gate and deliver it."',
    choices: [
      'Text back: "Sure, the code is 110948."',
      'Text back: "I cannot share the code. Please leave the package at the main leasing office or reschedule."',
      'Ignore the message and contact FedEx support directly.'
    ],
    correctChoice: 2,
    tell: 'Delivery drivers never need security verification codes to bypass gates or unlock access. This is a delivery redirection scam designed to transfer your package to a drop location or steal your account.',
    consequence: 'Giving the code would authorize a delivery redirect or package pick-up authorization, allowing the scammer to steal high-value shipments.'
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function OtpScamSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const scenario = OTP_SCENARIOS[index]

  function selectChoice(idx: number) {
    if (selectedIdx !== null) return
    setSelectedIdx(idx)
    if (idx === scenario.correctChoice) {
      setCorrectCount((c) => c + 1)
    }
  }

  async function next() {
    setSelectedIdx(null)
    if (index + 1 < OTP_SCENARIOS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('otp-scam', correctCount, OTP_SCENARIOS.length)
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
            <KeyRound size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">OTP Scam Simulator</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"The shield of Multi-Factor Authentication."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Attackers initiate transactions or account password resets, sending an OTP (One-Time Password) to your phone.
              They immediately call or message you, impersonating support, to coax the code from you.
              Your job: spot the social engineering attempt and protect the OTP code.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{OTP_SCENARIOS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Scenarios</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">50</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">6 Digits</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">OTP length</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Start Simulation <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / OTP_SCENARIOS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">OTP Lab Completed</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{OTP_SCENARIOS.length}</span>
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
  const isCorrect = selectedIdx === scenario.correctChoice

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">OTP AUTHENTICATOR</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Scenario {index + 1} of {OTP_SCENARIOS.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smartphone Screen showing SMS Inbox */}
        <div className="border border-white/10 bg-[#1E1F22]/90 rounded-lg p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">
              <MessageSquare size={12} /> New Text Message
            </div>
            <div className="rounded-lg border border-teal/10 bg-teal/5 p-4 relative overflow-hidden">
              <div className="font-mono text-[10px] text-teal font-bold">{scenario.service}</div>
              <p className="mt-2 text-xs text-slate-light leading-relaxed font-sans">{scenario.incomingSms}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-warning/70 uppercase tracking-wider mb-2">
              <PhoneCall size={12} /> Incoming Communication
            </div>
            <div className="rounded-lg border border-white/5 bg-[#141517] p-4 text-center">
              <span className="text-[11px] font-mono text-slate-light block mb-2">Social Engineer / Agent:</span>
              <p className="text-xs text-[#EFEDE6] italic leading-relaxed">"{scenario.agentMessage}"</p>
            </div>
          </div>
        </div>

        {/* Interaction Panel */}
        <div className="border border-white/10 bg-[#141517] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-3">Your Actions</div>
            <div className="flex flex-col gap-2.5">
              {scenario.choices.map((choice, ci) => {
                let btnClass = 'border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5'
                if (selectedIdx !== null) {
                  if (ci === scenario.correctChoice) btnClass = 'border-teal bg-teal/10 text-teal'
                  else if (ci === selectedIdx) btnClass = 'border-danger bg-danger/10 text-danger'
                  else btnClass = 'border-white/5 bg-white/[0.02] opacity-40'
                }

                return (
                  <button
                    key={ci}
                    onClick={() => selectChoice(ci)}
                    disabled={selectedIdx !== null}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-xs transition-all duration-200 cursor-pointer disabled:cursor-default ${btnClass}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                      {ci + 1}
                    </span>
                    <span className="flex-1">{choice}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback and advance */}
          {selectedIdx !== null && (
            <div className={`mt-6 p-4 rounded-lg border ${isCorrect ? 'border-teal/20 bg-teal/5 text-teal' : 'border-danger/20 bg-danger/5 text-danger'}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isCorrect ? 'Excellent choice!' : 'Critical security error.'}
              </div>
              <p className="mt-2 text-[11px] text-slate-light leading-relaxed">
                <strong className="text-[#EFEDE6]">Rule: </strong>{scenario.tell}
              </p>
              {!isCorrect && (
                <p className="mt-1.5 text-[11px] text-slate-light leading-relaxed">
                  <strong className="text-danger">Consequence: </strong>{scenario.consequence}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={next}>
                {index + 1 < OTP_SCENARIOS.length ? 'Next Scenario' : 'Finish Lab'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
