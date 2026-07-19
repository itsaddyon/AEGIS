import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldAlert, ArrowLeft, KeyRound, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface Challenge {
  id: number
  goal: string
  validate: (pw: string) => { valid: boolean; error?: string }
}

function estimateCrackTime(pw: string): { entropy: number; crackTimeStr: string; years: number } {
  if (!pw) return { entropy: 0, crackTimeStr: 'Instantly', years: 0 }
  
  let pool = 0
  if (/[a-z]/.test(pw)) pool += 26
  if (/[A-Z]/.test(pw)) pool += 26
  if (/[0-9]/.test(pw)) pool += 10
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32

  const entropy = Math.round(pw.length * Math.log2(pool || 1))
  
  // Rate: 10 billion guesses/sec (standard offline attack rig)
  const guesses = Math.pow(2, entropy)
  const seconds = guesses / 10000000000
  
  if (seconds < 1) {
    return { entropy, crackTimeStr: 'Instantly', years: 0 }
  }
  const minutes = seconds / 60
  if (minutes < 60) {
    return { entropy, crackTimeStr: `${Math.round(minutes)} minutes`, years: 0 }
  }
  const hours = minutes / 60
  if (hours < 24) {
    return { entropy, crackTimeStr: `${Math.round(hours)} hours`, years: 0 }
  }
  const days = hours / 24
  if (days < 365) {
    return { entropy, crackTimeStr: `${Math.round(days)} days`, years: 0 }
  }
  const years = days / 365
  if (years < 1000) {
    return { entropy, crackTimeStr: `${Math.round(years)} years`, years }
  }
  if (years < 1000000) {
    return { entropy, crackTimeStr: `${Math.round(years / 1000)} thousand years`, years }
  }
  return { entropy, crackTimeStr: `${Math.round(years / 1000000)} million years`, years }
}

const PASSWORD_CHALLENGES: Challenge[] = [
  {
    id: 1,
    goal: 'Create a password that takes at least 1 year to crack (Requires a combination of characters or decent length).',
    validate: (pw) => {
      const stats = estimateCrackTime(pw)
      if (stats.years < 1) {
        return { valid: false, error: 'Password is too weak. Crack time must be at least 1 year.' }
      }
      return { valid: true }
    }
  },
  {
    id: 2,
    goal: 'Create a long passphrase with at least 16 characters (Length is the single most important factor for security).',
    validate: (pw) => {
      if (pw.length < 16) {
        return { valid: false, error: 'Passphrase is too short. Must be at least 16 characters.' }
      }
      const stats = estimateCrackTime(pw)
      if (stats.years < 100) {
        return { valid: false, error: 'Even at 16 characters, your password complexity is too low. Try adding uppercase or numbers.' }
      }
      return { valid: true }
    }
  },
  {
    id: 3,
    goal: 'Create a super password: at least 12 characters, contains numbers, uppercase, lowercase, special characters, and takes over 1,000 years to crack.',
    validate: (pw) => {
      if (pw.length < 12) return { valid: false, error: 'Must be at least 12 characters.' }
      if (!/[0-9]/.test(pw)) return { valid: false, error: 'Must contain at least one number.' }
      if (!/[A-Z]/.test(pw)) return { valid: false, error: 'Must contain at least one uppercase letter.' }
      if (!/[^a-zA-Z0-9]/.test(pw)) return { valid: false, error: 'Must contain at least one special character.' }
      const stats = estimateCrackTime(pw)
      if (stats.years < 1000) return { valid: false, error: 'Must take over 1,000 years to crack.' }
      return { valid: true }
    }
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function PasswordLabSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [finalXp, setFinalXp] = useState<number | null>(null)

  const challenge = PASSWORD_CHALLENGES[challengeIdx]
  const { entropy, crackTimeStr } = estimateCrackTime(password)

  function checkPassword() {
    const check = challenge.validate(password)
    if (check.valid) {
      setErrorMsg('')
      setPassword('')
      if (challengeIdx + 1 < PASSWORD_CHALLENGES.length) {
        setChallengeIdx((i) => i + 1)
      } else {
        submitResult()
      }
    } else {
      setErrorMsg(check.error || 'Validation failed.')
    }
  }

  async function submitResult() {
    // 3 challenges all solved correctly
    const result = await getApi().submit_simulation_result('password-lab', PASSWORD_CHALLENGES.length, PASSWORD_CHALLENGES.length)
    setFinalXp(result.xpEarned ?? null)
    await refreshAll()
    setPhase('finished')
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
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Password Strength Lab</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Cracking times, entropy math, and passphrases."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Welcome to the cryptography workshop. Weak passwords are cracked in seconds using offline dictionary lists.
              Test password security in our real-time entropy calculator.
              Solve 3 progressive challenges to build resilient access credentials.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{PASSWORD_CHALLENGES.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Challenges</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">40</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Entropy</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Engine</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Enter Sandbox Workshop <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Cryptography Lab Cleared</h1>
          <p className="mt-2 text-sm text-slate-light">
            You successfully solved all 3 password-building challenges and mastered entropy calculations!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-4 py-2 font-mono text-xs text-teal">
            Complexity Status: Secure Passphrase Compliant
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
          <KeyRound size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">PASSWORD ENTROPY ANALYZER</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Challenge {challengeIdx + 1} of {PASSWORD_CHALLENGES.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sandbox details */}
        <div className="border border-white/10 bg-[#1E1F22]/90 rounded-lg p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">Active Challenge</div>
            <div className="rounded-md border border-teal/15 bg-teal/5 p-4 text-xs text-slate-light leading-relaxed font-mono">
              {challenge.goal}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider">Live Complexity Metrics</div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded border border-white/5 bg-[#141517] p-2">
                <div className="font-mono text-sm font-bold text-[#EFEDE6]">{entropy} bits</div>
                <div className="text-[8px] font-mono text-slate-light uppercase">Entropy</div>
              </div>
              <div className="rounded border border-white/5 bg-[#141517] p-2">
                <div className="font-mono text-sm font-bold text-teal">{crackTimeStr}</div>
                <div className="text-[8px] font-mono text-slate-light uppercase">Est. Crack Time</div>
              </div>
            </div>

            <div className="rounded border border-white/5 bg-[#141517] p-3 text-[10px] text-slate-light leading-relaxed flex gap-2">
              <Info size={14} className="text-teal shrink-0 mt-0.5" />
              <span>Offline attack configurations use graphics cards to verify up to 10 billion guess attempts per second. Entropy measures true mathematical unpredictability.</span>
            </div>
          </div>
        </div>

        {/* Input Interface */}
        <div className="border border-white/10 bg-[#141517] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-3">Password Input Console</div>
            
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrorMsg('')
              }}
              placeholder="Type password to analyze..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-[#EFEDE6] font-mono focus:border-teal/30 focus:outline-none"
            />

            {errorMsg && (
              <div className="mt-3 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-[11px] leading-relaxed flex gap-2">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <Button className="mt-6 w-full" onClick={checkPassword} disabled={!password}>
            Submit and Validate Password
          </Button>
        </div>
      </div>
    </div>
  )
}
