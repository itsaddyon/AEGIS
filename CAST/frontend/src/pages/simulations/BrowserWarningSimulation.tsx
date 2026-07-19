import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, ArrowLeft, RefreshCw, XCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface WarningRound {
  id: string
  title: string
  subtitle: string
  htmlLayout: 'google-red' | 'fake-adware' | 'ssl-block'
  correctChoice: 'obey' | 'ignore'
  choices: {
    label: string
    action: 'obey' | 'ignore'
  }[]
  tell: string
  consequence: string
}

const WARNING_ROUNDS: WarningRound[] = [
  {
    id: 'warn1',
    title: 'Google Safe Browsing Block',
    subtitle: 'Deceptive site ahead',
    htmlLayout: 'google-red',
    correctChoice: 'obey',
    choices: [
      { label: 'Obey block: Click "Back to safety" and close page.', action: 'obey' },
      { label: 'Ignore block: Click "Details" -> "visit this unsafe site".', action: 'ignore' }
    ],
    tell: 'The red "Deceptive site ahead" alert is a native browser warning powered by Google Safe Browsing. It flags known phishing or malware domains. You should ALWAYS obey it and close the tab.',
    consequence: 'Bypassing native security warnings exposes you directly to automated exploit kits or credential theft forms.'
  },
  {
    id: 'warn2',
    title: 'Scareware Tech Support Popup',
    subtitle: 'System Infected! Call Microsoft Security Support',
    htmlLayout: 'fake-adware',
    correctChoice: 'ignore',
    choices: [
      { label: 'Obey: Call the toll-free number to clean your computer.', action: 'obey' },
      { label: 'Ignore: Close the browser window or kill process.', action: 'ignore' }
    ],
    tell: 'Real operating systems and browsers will NEVER show toll-free phone numbers in alerts, nor will they ask you to call "support agents". This is a malicious popup (scareware) designed to trick you into granting remote access.',
    consequence: 'Calling the number leads to a scammer requesting teamviewer access, installing actual malware, and charging hundreds of dollars for "repairs".'
  },
  {
    id: 'warn3',
    title: 'SSL Certificate Invalid Screen',
    subtitle: 'Your connection is not private',
    htmlLayout: 'ssl-block',
    correctChoice: 'obey',
    choices: [
      { label: 'Obey: Stop browsing, leave page, and report network.', action: 'obey' },
      { label: 'Ignore: Click "Advanced" -> "Proceed to site (unsafe)".', action: 'ignore' }
    ],
    tell: 'An SSL mismatch warning means the domain name on the certificate doesn\'t match the server, or the traffic is being intercepted. This is common when connected to malicious public Wi-Fi networks (Man-in-the-Middle attacks). Do not proceed.',
    consequence: 'Proceeding allows anyone hosting the wireless access point to sniff your traffic, passwords, and sessions in cleartext.'
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function BrowserWarningSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [verdict, setVerdict] = useState<{ correct: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const round = WARNING_ROUNDS[index]

  function selectChoice(action: 'obey' | 'ignore') {
    const correct = action === round.correctChoice
    if (correct) setCorrectCount((c) => c + 1)
    setVerdict({ correct })
  }

  async function next() {
    setVerdict(null)
    if (index + 1 < WARNING_ROUNDS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('browser-warning', correctCount, WARNING_ROUNDS.length)
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
            <AlertTriangle size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Browser Warning Simulator</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Spot official blocks vs scareware traps."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Attackers trigger malicious web popups claiming your computer is infected with viruses (Scareware) to make you call fraud numbers.
              On the other hand, browsers present real security warning blocks (like Safe Browsing or SSL failures).
              Your job: distinguish official browser warnings (which you must obey) from fake popups (which you must ignore).
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{WARNING_ROUNDS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Warnings</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">40</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">SSL/Red</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Layouts</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Launch Browser Simulator <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / WARNING_ROUNDS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Browser Lab Completed</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{WARNING_ROUNDS.length}</span>
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
  const isCorrect = verdict ? verdict.correct : false

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">WARNING BLOCK IDENTIFICATION</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Round {index + 1} of {WARNING_ROUNDS.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rendered Warning Canvas */}
        <div className="border border-white/10 bg-[#0B0C0E]/90 rounded-lg p-4 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="h-6 bg-[#141517] rounded-t-md px-3 flex items-center justify-between border-b border-white/5 text-[9px] font-mono text-slate-light">
              <span>https://secure-nav-alert.org/warning</span>
              <RefreshCw size={8} />
            </div>

            {/* Layout Canvas */}
            <div className="mt-4 rounded-b-md overflow-hidden border border-white/15 min-h-[220px] relative flex flex-col justify-center p-6 bg-[#1A1C1E] text-center font-sans">
              
              {/* Google Red Screen */}
              {round.htmlLayout === 'google-red' && (
                <div className="bg-[#D93025] text-white p-6 absolute inset-0 text-left flex flex-col justify-between">
                  <div>
                    <AlertTriangle size={32} className="text-white" />
                    <h2 className="text-lg font-bold mt-3">Deceptive site ahead</h2>
                    <p className="text-xs text-white/90 mt-2 leading-relaxed">
                      Attackers on this site may trick you into doing something dangerous like installing software or revealing your personal info.
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded transition">Details</button>
                    <button className="bg-white text-[#D93025] font-bold text-xs px-4 py-1.5 rounded shadow transition">Back to safety</button>
                  </div>
                </div>
              )}

              {/* Fake Adware Scareware Popup */}
              {round.htmlLayout === 'fake-adware' && (
                <div className="bg-slate-900 text-slate-200 p-5 absolute inset-0 text-left flex flex-col justify-between bg-[#111] border border-red-600/50">
                  <div className="bg-red-600/20 border-l-4 border-red-600 p-2 text-[10px] font-bold text-red-500 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> CRITICAL VIRUS DETECTED
                  </div>
                  <div className="my-2">
                    <h3 className="text-xs font-bold text-slate-200">WINDOWS DEFENDER ERROR #0x3E8</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Your files are being leaked to a remote host. Call Microsoft Security Desk immediately at:
                    </p>
                    <span className="block text-sm font-bold text-yellow-500 font-mono text-center my-2 animate-pulse">
                      +1 (888) 555-0149 (Toll-Free)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1 rounded transition text-center">CALL SUPPORT NOW</button>
                    <button className="flex-1 border border-slate-700 hover:bg-slate-800 text-[10px] py-1 rounded transition text-center">Cancel</button>
                  </div>
                </div>
              )}

              {/* SSL Block */}
              {round.htmlLayout === 'ssl-block' && (
                <div className="bg-[#202124] text-white p-6 absolute inset-0 text-left flex flex-col justify-between">
                  <div>
                    <div className="text-red-500 font-bold text-lg">!</div>
                    <h2 className="text-base font-semibold mt-2">Your connection is not private</h2>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      Attackers might be trying to steal your information from this server (for example, passwords, messages, or credit cards). NET::ERR_CERT_COMMON_NAME_INVALID
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end mt-4">
                    <button className="bg-transparent text-slate-300 font-semibold text-[10px] px-3 py-1.5 rounded border border-slate-700">Advanced</button>
                    <button className="bg-blue-600 text-white font-bold text-[10px] px-4 py-1.5 rounded">Back to safety</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border border-white/10 bg-[#1E1F22] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">Analyze Threat Alert</div>
            <p className="text-xs text-slate-light leading-relaxed mb-4">
              Review the layout details. Is this an official system warning, or is it scareware pretending to be support?
            </p>

            {!verdict && (
              <div className="space-y-2">
                {round.choices.map((choice, ci) => (
                  <button
                    key={ci}
                    onClick={() => selectChoice(choice.action)}
                    className="w-full flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5 px-4 py-3 text-left text-xs transition-all duration-200 cursor-pointer"
                  >
                    <span className="font-mono text-teal mt-0.5">▸</span>
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {verdict && (
            <div className={`p-4 rounded-lg border mt-4 ${isCorrect ? 'border-teal/20 bg-teal/5 text-teal' : 'border-danger/20 bg-danger/5 text-danger'}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isCorrect ? 'Correct Decision!' : 'Security Error.'}
              </div>
              <p className="mt-2 text-[11px] text-[#EFEDE6] font-semibold">
                {isCorrect ? 'You accurately identified the warning vector.' : 'Caution: you fell for the alert lure.'}
              </p>
              <p className="mt-2 text-[11px] text-slate-light leading-relaxed">
                <strong className="text-[#EFEDE6]">Mechanism: </strong>{round.tell}
              </p>
              {!isCorrect && (
                <p className="mt-1.5 text-[11px] text-slate-light leading-relaxed">
                  <strong className="text-danger">Consequence: </strong>{round.consequence}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={next}>
                {index + 1 < WARNING_ROUNDS.length ? 'Next warning' : 'Finish Browser Lab'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
