import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Usb, ShieldAlert, ShieldCheck, ArrowLeft, Terminal, FolderOpen, AlertOctagon, HelpCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApi } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

type Phase = 'briefing' | 'decision' | 'desktop' | 'compromised' | 'finished'

interface UsbFile {
  name: string
  type: 'pdf' | 'lnk' | 'jpg' | 'txt'
  actualExtension: string
  isMalicious: boolean
  description: string
}

const USB_FILES: UsbFile[] = [
  {
    name: 'Salary_Scale_2026_Q3.pdf',
    type: 'pdf',
    actualExtension: '.exe',
    isMalicious: true,
    description: 'Looks like a PDF document, but the actual file type is an executable (.exe) designed to run malware.'
  },
  {
    name: 'Important_Shortcut',
    type: 'lnk',
    actualExtension: '.lnk',
    isMalicious: true,
    description: 'A shortcut file (.lnk) that triggers a PowerShell script in the background to fetch a remote payload.'
  },
  {
    name: 'Corporate_Logo',
    type: 'jpg',
    actualExtension: '.jpg',
    isMalicious: false,
    description: 'A standard JPEG image file containing the company logo.'
  },
  {
    name: 'ReadMe_First',
    type: 'txt',
    actualExtension: '.txt',
    isMalicious: false,
    description: 'A basic text file containing owner information.'
  }
]

export function UsbAttackSimulation() {
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const [phase, setPhase] = useState<Phase>('briefing')
  const [doubleClickedFile, setDoubleClickedFile] = useState<UsbFile | null>(null)
  const [reportedToSecurity, setReportedToSecurity] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UsbFile | null>(null)
  const [score, setScore] = useState(0)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  function handleDecision(plugIn: boolean) {
    if (!plugIn) {
      // Safe choice - immediately pass with max points
      setScore(100)
      setReportedToSecurity(true)
      submitResult(1, 1)
    } else {
      setPhase('desktop')
    }
  }

  async function submitResult(correct: number, total: number) {
    const result = await getApi().submit_simulation_result('usb-attack', correct, total)
    setFinalXp(result.xpEarned ?? null)
    await refreshAll()
    setPhase('finished')
  }

  function handleFileDoubleClick(file: UsbFile) {
    if (file.isMalicious) {
      setDoubleClickedFile(file)
      setPhase('compromised')
    } else {
      setDoubleClickedFile(file)
    }
  }

  function reportFromDesktop() {
    setScore(50) // partial credit for not running malicious files but still plugging it in
    setReportedToSecurity(true)
    submitResult(1, 2)
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
            <Usb size={40} className="mx-auto text-teal" />
            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">USB Attack Simulator</h1>
            <p className="mt-1 text-sm font-mono text-teal/60 italic">"Physical vectors and malicious payloads."</p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed text-left">
              An attacker leaves a USB drive in the office elevator or parking lot. It is labeled "Salary Reviews".
              Plugging it in could execute malware or keyboard emulators (BadUSB).
              Your job: choose the secure action, or explore the sandboxed files without launching threats.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Sandboxed</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">OS</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-teal">50</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">XP Reward</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-bold font-mono text-[#EFEDE6]">Extension</div>
                <div className="text-[10px] font-mono text-slate-light uppercase">Check</div>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => setPhase('decision')}>
              Proceed to Elevator <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── DECISION (ELEVATOR) ─────────────────────────────
  if (phase === 'decision') {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="border border-white/10 bg-[#1E1F22] rounded-lg p-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center text-teal mb-4">
            <Usb size={20} />
          </div>
          <h2 className="text-lg font-semibold text-[#EFEDE6]"> elevator find</h2>
          <p className="mt-2 text-xs text-slate-light leading-relaxed">
            You see a silver USB drive sitting on the elevator floor. It is labeled:
            <strong className="text-teal block my-2 font-mono text-sm">"SALARY_REVIEWS_2026_Q3"</strong>
            What do you do?
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => handleDecision(false)}>
              Do NOT plug it in — Report to Security Team
            </Button>
            <Button variant="secondary" onClick={() => handleDecision(true)}>
              Plug it in to look for owner info
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── COMPROMISED (RANSOMWARE) ────────────────────────
  if (phase === 'compromised') {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="border border-danger/40 bg-danger/10 rounded-lg p-8">
          <AlertOctagon size={48} className="mx-auto text-danger animate-bounce" />
          <h1 className="mt-4 text-xl font-bold text-danger uppercase tracking-wider font-mono">SYSTEM COMPROMISED</h1>
          <p className="mt-2 text-xs text-slate-light leading-relaxed">
            By running <code className="text-danger font-mono font-bold bg-danger/15 px-1 rounded">{doubleClickedFile?.name}{doubleClickedFile?.actualExtension}</code>,
            you executed a malicious payload. The system has initiated an unauthorized network connection and encrypted local documents.
          </p>
          <p className="mt-4 text-xs text-slate-light/60">
            <strong>Rule:</strong> Never plug in unknown USB devices, and never open executable extensions (.exe, .lnk, .scr, .vbs) disguised as document files.
          </p>
          <Button className="mt-6 w-full" variant="secondary" onClick={() => submitResult(0, 1)}>
            Complete Lab (0 XP)
          </Button>
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
          <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">USB Threat Assessment Completed</h1>
          <p className="mt-2 text-sm text-slate-light">
            {reportedToSecurity && score === 100 
              ? 'Security Compliant! You correctly refused to plug in the device and reported it immediately.' 
              : 'Partial Credit. You plugged the device in, but avoided launching the dangerous executable payloads before reporting.'}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-4 py-2 font-mono text-xs text-teal">
            Score: {score}%
          </div>
          {finalXp != null && <p className="mt-3 text-sm text-teal font-mono">+{finalXp} XP earned</p>}
          <Button className="mt-6" onClick={() => navigate('/practice-lab')}>
            <ArrowLeft size={14} /> Back to Practice Lab
          </Button>
        </div>
      </div>
    )
  }

  // ─── DESKTOP (VIRTUAL SANDBOX) ───────────────────────
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-teal" />
          <span className="font-mono text-xs text-[#EFEDE6] uppercase tracking-wider">Virtual OS Sandbox Environment</span>
        </div>
        <Button onClick={reportFromDesktop} className="bg-danger/25 border-danger/30 text-[#EFEDE6] hover:bg-danger/40 px-2 py-1 text-[11px] rounded-lg">
          Eject & Report USB to Security
        </Button>
      </div>

      <div className="border border-white/10 bg-[#0B0C0E] rounded-lg overflow-hidden flex flex-col min-h-[380px]">
        {/* Topbar of OS */}
        <div className="h-8 bg-[#141517] border-b border-white/5 px-4 flex items-center justify-between text-[11px] font-mono text-slate-light">
          <span className="flex items-center gap-1.5"><FolderOpen size={12} className="text-teal" /> USB Drive (D:)</span>
          <span>4 files found</span>
        </div>

        <div className="flex-1 bg-[#1A1C1E] p-6 grid grid-cols-4 gap-4 items-start content-start">
          {USB_FILES.map((file, fi) => {
            const isSelected = selectedFile?.name === file.name
            return (
              <div
                key={fi}
                onClick={() => setSelectedFile(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                className={`p-3 rounded-md flex flex-col items-center justify-center text-center cursor-pointer transition border ${
                  isSelected ? 'bg-teal/15 border-teal/40' : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center text-slate-light mb-2">
                  <FolderOpen size={20} className={file.isMalicious ? 'text-warning/70' : 'text-slate-light'} />
                </div>
                <div className="text-[10px] font-mono text-slate-light font-bold truncate w-full">{file.name}</div>
                <div className="text-[9px] font-mono text-slate-light/60">{file.actualExtension}</div>
              </div>
            )
          })}
        </div>

        {/* Sidebar Info/Properties */}
        <div className="border-t border-white/5 bg-[#141517] p-4 flex gap-4 text-xs">
          <div className="flex-1">
            <span className="text-[10px] font-mono text-teal/50 uppercase block mb-1">File Inspector</span>
            {selectedFile ? (
              <div>
                <div className="font-bold text-[#EFEDE6]">{selectedFile.name}{selectedFile.actualExtension}</div>
                <p className="mt-1 text-slate-light text-[11px] leading-relaxed">{selectedFile.description}</p>
                {selectedFile.isMalicious && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-danger">
                    <ShieldAlert size={12} /> Double-clicking will run malware!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-light/50 flex items-center gap-1.5 py-2">
                <HelpCircle size={14} /> Click a file once to inspect its metadata. Double-click to execute.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
