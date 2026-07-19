import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ShieldCheck, ArrowLeft, Send, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface ChatMessage {
  sender: 'recruiter' | 'user'
  text: string
}

interface ChatTurn {
  recruiterPrompt: string
  choices: {
    text: string
    correct: boolean
    feedback: string
  }[]
}

const CHAT_TURNS: ChatTurn[] = [
  {
    recruiterPrompt: "Hi there! I'm Sarah, a senior tech recruiter at Zenith Global. I came across your LinkedIn profile and love your background. We have an opening for a lead role with 30% higher compensation. Are you open to discussing?",
    choices: [
      {
        text: "Yes, definitely! Sounds very exciting. What are the next steps?",
        correct: true,
        feedback: "It is safe to express general interest, but you must remain cautious about what details you share next."
      },
      {
        text: "Please send me the official job description and NDA link to my corporate email address first.",
        correct: false,
        feedback: "Never ask recruiters to send external links to your corporate email. This invites phishing payloads directly inside the corporate network firewall."
      }
    ]
  },
  {
    recruiterPrompt: "Great! Our tech panel wants to make sure your experience matches our current architecture. Are you currently using Jenkins v2.4 with the active directory integration, or do you use GitHub Actions? Also, what version of AWS/Kubernetes do you deploy on?",
    choices: [
      {
        text: "We use standard modern CI/CD systems, but corporate policy prevents me from sharing specific tool versions and internal configurations. I can discuss generic design patterns though.",
        correct: true,
        feedback: "Perfect. Deflecting specific software versions prevents attackers from researching matching Zero-Day CVE exploits against your infrastructure."
      },
      {
        text: "Oh, we actually migrated from Jenkins to GitHub Actions recently. We run Kubernetes v1.28 on AWS, using ArgoCD for deployments.",
        correct: false,
        feedback: "You leaked internal stack details and software versions. Attackers harvest this technical intelligence to map vulnerability surfaces."
      }
    ]
  },
  {
    recruiterPrompt: "Understood, compliance first! Let's schedule a call. To register you in our visitor portal, can you email me a clear photo of your employee access badge? Just to verify your active employment.",
    choices: [
      {
        text: "I cannot take or share photos of my corporate ID badge. We can verify employment via LinkedIn or an official employment verification letter if we reach the offer stage.",
        correct: true,
        feedback: "Correct! Sharing badges exposes barcodes, names, levels, and security holograms that attackers use to clone badges or gain physical entry."
      },
      {
        text: "Sure, let me snap a quick picture of my security badge and attach it here.",
        correct: false,
        feedback: "Sharing photos of ID cards allows physical badge cloning and reveals facility access privileges."
      }
    ]
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function SocialChatSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [turnIndex, setTurnIndex] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const currentTurn = CHAT_TURNS[turnIndex]

  function startChat() {
    setPhase('simulation')
    setMessages([
      { sender: 'recruiter', text: CHAT_TURNS[0].recruiterPrompt }
    ])
  }

  function handleChoice(ci: number) {
    if (selectedChoiceIdx !== null) return
    setSelectedChoiceIdx(ci)

    const choice = currentTurn.choices[ci]
    if (choice.correct) setCorrectCount((c) => c + 1)

    // Add user response to chat stream
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: choice.text }
    ])
  }

  async function nextTurn() {
    setSelectedChoiceIdx(null)
    const nextIdx = turnIndex + 1

    if (nextIdx < CHAT_TURNS.length) {
      setTurnIndex(nextIdx)
      setMessages((prev) => [
        ...prev,
        { sender: 'recruiter', text: CHAT_TURNS[nextIdx].recruiterPrompt }
      ])
    } else {
      const result = await getApi().submit_simulation_result('social-chat', correctCount, CHAT_TURNS.length)
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
            <MessageSquare size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Social Engineering Chat</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Spot information harvesting in conversation."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Attackers pose as recruiters, business partners, or friendly support reps on chat networks.
              They build trust and slowly coax sensitive info (tech versions, badge pictures, internal directories).
              Navigate the chat, protect confidential info, and spot the warning signs.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{CHAT_TURNS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Turns</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">70</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Chat</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Interface</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={startChat}>
              Open Chat Client <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / CHAT_TURNS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Chat Assessment Completed</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{CHAT_TURNS.length}</span>
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
  const activeChoice = selectedChoiceIdx !== null ? currentTurn.choices[selectedChoiceIdx] : null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">PROFESSIONAL CHAT HUD</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Turn {turnIndex + 1} of {CHAT_TURNS.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chat window */}
        <div className="border border-white/10 bg-[#0B0C0E]/90 rounded-lg flex flex-col justify-between min-h-[380px] overflow-hidden">
          {/* Channel Header */}
          <div className="h-10 bg-[#141517] border-b border-white/5 px-4 flex items-center gap-2 text-xs font-mono text-[#EFEDE6]">
            <div className="w-2.5 h-2.5 rounded-full bg-teal" />
            <span>Sarah (Zenith Global Recruitment)</span>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, mi) => {
              const isUser = msg.sender === 'user'
              return (
                <div key={mi} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-teal/15 border border-teal/20 text-teal' 
                      : 'bg-white/5 border border-white/10 text-slate-light'
                  }`}>
                    <div className="font-mono text-[9px] text-[#EFEDE6]/50 mb-1">
                      {isUser ? 'You' : 'Sarah'}
                    </div>
                    {msg.text}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input box */}
          <div className="h-12 bg-[#141517] border-t border-white/5 px-3 flex items-center justify-between text-xs text-slate-light font-mono">
            <span>Type response...</span>
            <Send size={14} className="text-slate-light/40" />
          </div>
        </div>

        {/* Choice selector */}
        <div className="border border-white/10 bg-[#1E1F22] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-3">Choose Your Reply</div>
            <div className="space-y-2">
              {currentTurn.choices.map((choice, ci) => {
                let btnClass = 'border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5'
                if (selectedChoiceIdx !== null) {
                  if (choice.correct) btnClass = 'border-teal bg-teal/10 text-teal'
                  else if (ci === selectedChoiceIdx) btnClass = 'border-danger bg-danger/10 text-danger'
                  else btnClass = 'border-white/5 bg-white/[0.02] opacity-40'
                }

                return (
                  <button
                    key={ci}
                    onClick={() => handleChoice(ci)}
                    disabled={selectedChoiceIdx !== null}
                    className={`w-full flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-xs transition-all duration-200 cursor-pointer disabled:cursor-default ${btnClass}`}
                  >
                    <span className="font-mono text-teal mt-0.5">▸</span>
                    <span className="flex-1">{choice.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback display */}
          {activeChoice && (
            <div className={`p-4 rounded-lg border mt-4 ${activeChoice.correct ? 'border-teal/20 bg-teal/5 text-teal' : 'border-danger/20 bg-danger/5 text-danger'}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {activeChoice.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {activeChoice.correct ? 'Safe Response' : 'Security Breach!'}
              </div>
              <p className="mt-2 text-[11px] text-slate-light leading-relaxed">
                {activeChoice.feedback}
              </p>
              <Button className="mt-4 w-full" onClick={nextTurn}>
                {turnIndex + 1 < CHAT_TURNS.length ? 'Next Dialogue' : 'Finish Chat Lab'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
