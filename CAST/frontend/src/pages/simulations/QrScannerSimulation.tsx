import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, ShieldAlert, ShieldCheck, Lock, Unlock, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

interface QrRound {
  id: string
  context: string
  qrTitle: string
  scannedUrl: string
  isFake: boolean
  tell: string
  consequence: string
}

const QR_ROUNDS: QrRound[] = [
  {
    id: 'qr1',
    context: 'You see a sticker on a Starbucks table offering "Scan for 50% off any beverage today only!"',
    qrTitle: 'Starbucks Coffee 50% Off Promo',
    scannedUrl: 'https://starbucks-rewards-deals.com/coupon-claim',
    isFake: true,
    tell: 'The domain is "starbucks-rewards-deals.com", which is not Starbucks\' official domain (starbucks.com). Scammers frequently put fake QR stickers on top of real tables in public places (a practice called "quishing").',
    consequence: 'Claiming the coupon requires entering your Starbucks rewards login or payment card, which would be harvested by the attacker.'
  },
  {
    id: 'qr2',
    context: 'A flyer on the office bulletin board says: "System upgrade required for all employee badges. Scan immediately."',
    qrTitle: 'Office HR Employee Verification Portal',
    scannedUrl: 'https://verify-badge-rit.ac.in/verify',
    isFake: false,
    tell: 'The scanned URL is a subdomain of the official institutional domain ("rit.ac.in"), indicating it is legitimate and secure.',
    consequence: 'No threat. This is a legitimate internal HR update.'
  },
  {
    id: 'qr3',
    context: 'You receive an urgent parcel in the mail. The label says: "Delivery failed. Scan code to pay $1 customs fee and reschedule."',
    qrTitle: 'Postal Delivery Rescheduling Label',
    scannedUrl: 'http://postal-customs-clearance.net/pay',
    isFake: true,
    tell: 'The domain is "postal-customs-clearance.net" and it uses unencrypted HTTP ("http://"). Real postal services use secure HTTPS and official domains (e.g. usps.com, indiapost.gov.in).',
    consequence: 'Paying the small customs fee hands your credit card number, CVV, and expiration date directly to a card-harvesting syndicate.'
  }
]

type Phase = 'briefing' | 'simulation' | 'finished'

export function QrScannerSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [index, setIndex] = useState(0)
  const [verdict, setVerdict] = useState<{ correct: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const round = QR_ROUNDS[index]

  function startScan() {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
    }, 2000)
  }

  function answer(choseIsFake: boolean) {
    const correct = choseIsFake === round.isFake
    if (correct) setCorrectCount((c) => c + 1)
    setVerdict({ correct })
  }

  async function next() {
    setVerdict(null)
    setScanned(false)
    if (index + 1 < QR_ROUNDS.length) {
      setIndex((i) => i + 1)
    } else {
      const result = await getApi().submit_simulation_result('qr-scanner', correctCount, QR_ROUNDS.length)
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
            <QrCode size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">QR Code Scanner</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Verify the link behind the pattern."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              Attackers print malicious QR codes (Quishing) and stick them on flyers, parking meters, or public spots.
              Use your mobile camera simulator to scan each QR code, inspect the decrypted URL, and decide if it is safe or a trap.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">{QR_ROUNDS.length}</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Rounds</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">40</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Safe/Fake</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Decision</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('simulation')}>
              Launch Viewfinder <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FINISHED ────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((correctCount / QR_ROUNDS.length) * 100)
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-teal/20 bg-teal/5 rounded-lg p-8">
          <ShieldCheck size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">Scans Completed</h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-3xl font-bold font-mono text-teal">{correctCount}</span>
            <span className="text-slate-light">/</span>
            <span className="text-3xl font-bold font-mono text-slate-light">{QR_ROUNDS.length}</span>
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
  const isHttps = round.scannedUrl.startsWith('https://')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-teal" />
          <span className="font-mono text-sm font-bold tracking-wider text-[#EFEDE6]">QUISHING SIMULATOR</span>
        </div>
        <span className="text-[10px] font-mono text-slate-light">Round {index + 1} of {QR_ROUNDS.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario description & physical QR code sticker */}
        <div className="border border-white/10 bg-[#1E1F22]/80 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-teal/50 uppercase tracking-wider mb-2">Scenario Context</div>
            <p className="text-xs text-slate-light leading-relaxed">{round.context}</p>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center p-6 border border-white/5 rounded-md bg-[#141517]">
            <div className="relative p-3 bg-white rounded-lg shadow-lg">
              {/* Dummy QR code matrix style */}
              <div className="w-32 h-32 bg-[radial-gradient(circle_at_center,black_30%,transparent_35%)] bg-[size:10px_10px] flex items-center justify-center border-4 border-black relative">
                <div className="absolute top-1 left-1 w-6 h-6 border-4 border-black bg-white" />
                <div className="absolute top-1 right-1 w-6 h-6 border-4 border-black bg-white" />
                <div className="absolute bottom-1 left-1 w-6 h-6 border-4 border-black bg-white" />
              </div>
            </div>
            <span className="mt-3 text-[10px] font-mono text-slate-light">{round.qrTitle}</span>
          </div>
        </div>

        {/* Smartphone Camera Interface */}
        <div className="border border-white/10 bg-[#141517] rounded-lg overflow-hidden flex flex-col min-h-[350px]">
          {/* Top Notch */}
          <div className="h-6 bg-[#0B0C0E] flex items-center justify-center text-[9px] font-mono text-slate-light/60 px-4">
            <span>MOBILE SCANNER V1.2</span>
          </div>

          {/* Viewfinder Display */}
          <div className="flex-1 bg-[#0f1012] relative flex flex-col items-center justify-center p-4 border-y border-white/5 overflow-hidden">
            {!scanned && !scanning && (
              <div className="text-center">
                <Button onClick={startScan}>
                  <QrCode size={14} /> Scan QR Code
                </Button>
              </div>
            )}

            {scanning && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 border-2 border-teal border-dashed animate-pulse rounded-md relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-teal animate-bounce" />
                </div>
                <span className="font-mono text-xs text-teal animate-pulse">Decrypting code...</span>
              </div>
            )}

            {scanned && (
              <div className="w-full space-y-4">
                <div className="rounded-md bg-teal/10 border border-teal/20 p-3 text-center">
                  <span className="text-[10px] font-mono text-teal/80 uppercase">DECRYPTED URL INCOMING</span>
                </div>

                {/* Simulated address bar pop-up on mobile */}
                <div className="rounded-md border border-white/10 bg-white/5 p-3 font-mono text-xs text-slate-light break-all flex items-center gap-2">
                  {isHttps ? <Lock size={12} className="text-teal shrink-0" /> : <Unlock size={12} className="text-warning shrink-0" />}
                  <span>{round.scannedUrl}</span>
                </div>

                {!verdict && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="secondary" onClick={() => answer(false)}>
                      This is Safe (Visit URL)
                    </Button>
                    <Button onClick={() => answer(true)}>
                      This is Phishing (Block)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verdict and Feedback panel */}
          {verdict && (
            <div className={`p-4 border-t ${verdict.correct ? 'bg-teal/10 border-teal/20 text-teal' : 'bg-danger/10 border-danger/20 text-danger'}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {verdict.correct ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                {verdict.correct ? 'Correct Action Taken!' : 'Compromised!'}
              </div>
              <p className="mt-2 text-[11px] text-slate-light leading-relaxed">
                <strong className="text-[#EFEDE6]">Analyze: </strong>{round.tell}
              </p>
              {!verdict.correct && (
                <p className="mt-1.5 text-[11px] text-slate-light leading-relaxed">
                  <strong className="text-danger">Consequence: </strong>{round.consequence}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={next}>
                {index + 1 < QR_ROUNDS.length ? 'Next Scan' : 'Finish Simulator'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
