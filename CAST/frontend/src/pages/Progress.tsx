import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import { getApi } from '@/lib/api'
import type { ActivityLogEntry, Certificate } from '@/types'
import { Award, Printer, X, ShieldCheck, BadgeCheck } from 'lucide-react'

export function Progress() {
  const profile = useAppStore((s) => s.profile)
  const missions = useAppStore((s) => s.missions)
  const simulations = useAppStore((s) => s.simulations)
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [activeCert, setActiveCert] = useState<Certificate | null>(null)

  useEffect(() => {
    getApi().get_recent_activity().then(setActivity)
    getApi().list_certificates().then(setCertificates)
  }, [])

  const completedMissions = missions.filter((m) => m.status === 'completed').length
  const completedSimulations = simulations.filter((s) => (s.attempt_count ?? 0) > 0).length

  const allMissionsDone = completedMissions === missions.length && missions.length > 0
  const allSimulationsDone = completedSimulations === simulations.length && simulations.length > 0
  const allDone = allMissionsDone && allSimulationsDone

  const missionPct = missions.length ? Math.round((completedMissions / missions.length) * 100) : 0
  const simulationPct = simulations.length ? Math.round((completedSimulations / simulations.length) * 100) : 0

  const totalItems = missions.length + simulations.length
  const completedItems = completedMissions + completedSimulations
  const pct = totalItems ? Math.round((completedItems / totalItems) * 100) : 0

  async function claimCertificate() {
    if (!profile) return
    const cert = await getApi().issue_certificate(profile.display_name, pct)
    setCertificates((c) => [cert, ...c])
    setActiveCert(cert) // Open preview immediately
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="mx-auto max-w-3xl print:p-0 print:max-w-none">
      {/* Hide standard UI when printing */}
      <div className="print:hidden">
        <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
          PROGRESS & CREDENTIALS
        </h1>
        <p className="mt-1 text-xs font-mono text-slate-light tracking-wide">
          Track active stats, claim certifications, and view security training logs.
        </p>

        {/* Completion Progress Card */}
        <Card className="mt-8 border-white/10 bg-white/5 shadow-[0_0_15px_rgba(63,125,119,0.05)] space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-light">
              <span className="uppercase tracking-wider">Overall Training Completion</span>
              <span>{completedItems} / {totalItems} COMPLETED</span>
            </div>
            <div className="mt-3"><ProgressBar pct={pct} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex justify-between text-[11px] font-mono text-slate-light">
                <span>Missions</span>
                <span className={allMissionsDone ? 'text-teal' : ''}>{completedMissions} / {missions.length} Done</span>
              </div>
              <div className="mt-2"><ProgressBar pct={missionPct} /></div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex justify-between text-[11px] font-mono text-slate-light">
                <span>Practice Labs</span>
                <span className={allSimulationsDone ? 'text-teal' : ''}>{completedSimulations} / {simulations.length} Done</span>
              </div>
              <div className="mt-2"><ProgressBar pct={simulationPct} /></div>
            </div>
          </div>

          {allDone ? (
            <div className="mt-4 pt-2 flex items-center gap-3">
              <Button onClick={claimCertificate} className="shadow-[0_0_15px_rgba(63,125,119,0.2)] w-full justify-center">
                <Award size={14} /> Claim Official Certificate
              </Button>
            </div>
          ) : (
            <div className="pt-2 text-xs font-mono text-slate-light/60 flex items-start gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
              <BadgeCheck size={14} className="text-teal shrink-0 mt-0.5" />
              <span>
                To claim your **Official training Certificate**, you must complete all **{missions.length} Missions** and attempt all **{simulations.length} Practice Labs**.
              </span>
            </div>
          )}
        </Card>

        {/* Claimed Certificates list */}
        {certificates.length > 0 && (
          <div className="mt-8">
            <div className="font-mono text-xs uppercase tracking-widest text-teal font-bold mb-3">Issued Credentials</div>
            <div className="flex flex-col gap-3">
              {certificates.map((c) => (
                <Card key={c.id} className="flex items-center justify-between border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5 transition duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-md bg-teal/10 text-teal">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#EFEDE6]">{c.display_name}</div>
                      <div className="text-[10px] font-mono text-slate-light/60 mt-0.5">
                        Score {c.final_score}% · Issued {c.issued_at} · ID: {c.id}
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" className="px-2.5 py-1 text-xs rounded-lg" onClick={() => setActiveCert(c)}>
                    View Certificate
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Log */}
        <div className="mt-8">
          <div className="font-mono text-xs uppercase tracking-widest text-teal font-bold mb-3">Activity Log</div>
          <div className="flex flex-col gap-2">
            {activity.map((a, i) => (
              <Card key={i} className="flex items-center justify-between py-3 border-white/5 bg-[#141517]/50 text-xs">
                <span className="text-slate-light font-mono">{a.label}</span>
                <span className="font-mono text-teal">+{a.xp_delta} XP</span>
              </Card>
            ))}
            {activity.length === 0 && (
              <p className="text-xs font-mono text-slate-light/50 text-center py-6">
                No recorded system events. Complete training missions to log activity.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- PREMIUM PRINTABLE CERTIFICATE MODAL --- */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C0E]/90 backdrop-blur-md p-4 print:contents">
          {/* Main Container */}
          <div className="relative w-full max-w-4xl border border-white/10 bg-[#141517] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(63,125,119,0.15)] flex flex-col print:contents">
            
            {/* Modal Header controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 print:hidden bg-[#1E1F22]">
              <span className="font-mono text-xs text-[#EFEDE6] font-bold uppercase tracking-wider">Credential Verification Viewer</span>
              <div className="flex items-center gap-2">
                <Button className="px-2.5 py-1 text-xs rounded-lg" onClick={handlePrint}>
                  <Printer size={12} /> Print PDF
                </Button>
                <button onClick={() => setActiveCert(null)} className="text-slate-light hover:text-[#EFEDE6] transition p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Certificate Canvas Box */}
            <div id="certificate-canvas" className="p-1 border border-teal/20 bg-[#090B0D] rounded-lg relative print:border-none">
              
              {/* High-Tech Inner Border */}
              <div className="p-8 flex flex-col justify-between min-h-[530px] bg-[#0E1116] border-2 border-teal/40 relative overflow-hidden">
                
                {/* Holographic Watermark Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="cert-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2dd4bf" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cert-grid)" />
                  </svg>
                </div>

                {/* Glowing Background Radial */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(45,212,191,0.06)_0%,transparent_60%)] pointer-events-none" />

                {/* Technical Corner Markers */}
                <div className="absolute top-6 left-6 font-mono text-[7px] text-teal/40 tracking-widest">
                  SYS_STATUS: SECURE // INTEGRITY_HASH: 0x9FB8A0
                </div>
                <div className="absolute top-6 right-6 font-mono text-[7px] text-teal/40 tracking-widest">
                  IPC_BRIDGE: ACTIVE // CLOUD_SYNC: SHIELDED
                </div>

                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-teal/50" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-teal/50" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-teal/50" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-teal/50" />

                {/* Header Section */}
                <div className="text-center relative z-10 space-y-2 mt-4">
                  <div className="flex justify-center mb-1">
                    <div className="p-2.5 rounded-xl bg-teal/10 border border-teal/20 text-teal shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                      <BadgeCheck size={28} />
                    </div>
                  </div>
                  <h1 className="font-mono text-[9px] tracking-[0.3em] text-teal/80 uppercase font-bold">
                    SENTINEL CYBER SAFETY NETWORK
                  </h1>
                  <h2 className="font-mono text-xl font-black text-[#EFEDE6] tracking-widest uppercase mt-1">
                    Certificate of Competency
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-10 h-[1px] bg-teal/20" />
                    <span className="font-mono text-[8px] text-teal/50">SECURE LOG ENGAGEMENT</span>
                    <div className="w-10 h-[1px] bg-teal/20" />
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="text-center my-6 relative z-10 space-y-4">
                  <span className="text-[10px] font-mono text-slate-light tracking-wider uppercase opacity-80">
                    This digital credential is authenticated and awarded to
                  </span>
                  
                  <div className="relative py-2 inline-block mx-auto px-6">
                    {/* Corner sub-indicators */}
                    <span className="absolute top-0 left-0 font-mono text-[10px] text-teal/40">[+]</span>
                    <span className="absolute top-0 right-0 font-mono text-[10px] text-teal/40">[+]</span>
                    <div className="text-3xl font-extrabold font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                      {activeCert.display_name}
                    </div>
                    <span className="absolute bottom-0 left-0 font-mono text-[10px] text-teal/40">[+]</span>
                    <span className="absolute bottom-0 right-0 font-mono text-[10px] text-teal/40">[+]</span>
                  </div>

                  <p className="text-xs text-slate-light font-mono leading-relaxed max-w-lg mx-auto">
                    For executing simulated target engagements in the Cyber Awareness Simulation Trainer, detecting social engineering vectors, auditing password entropy thresholds, and proving defensive SeOps competency.
                  </p>
                </div>

                {/* Footer Block */}
                <div className="flex items-end justify-between mt-4 relative z-10 print:mt-10">
                  
                  {/* Left Side: Telemetry / ID */}
                  <div className="font-mono text-[8px] text-slate-light/60 space-y-1">
                    <div>CREDENTIAL_ID: <span className="text-[#EFEDE6] font-bold">{activeCert.id}</span></div>
                    <div>ISSUED_DATE: <span className="text-[#EFEDE6]">{activeCert.issued_at}</span></div>
                    <div>PERFORMANCE_INDEX: <span className="text-teal font-bold">{activeCert.final_score}% COMPLETED</span></div>
                  </div>

                  {/* Center: Secure Verification Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-teal/30 bg-[#0E1116] flex items-center justify-center text-teal shadow-[0_0_15px_rgba(45,212,191,0.1)] relative">
                      {/* Decorative outer dots */}
                      <div className="absolute inset-1 rounded-full border border-dashed border-teal/10 animate-spin-slow" />
                      <ShieldCheck size={22} className="animate-pulse" />
                    </div>
                    <span className="text-[6px] font-mono tracking-widest text-teal/60 uppercase mt-1">INTEGRITY CHECK PASSED</span>
                  </div>

                  {/* Right Side: Digital Signatures */}
                  <div className="text-right font-mono text-[8px] text-slate-light/60 space-y-1">
                    <div className="italic text-teal/80 font-semibold text-xs tracking-wider">CAST SecOps Board</div>
                    <div className="w-28 h-[1px] bg-teal/20 ml-auto" />
                    <div className="text-[7px] text-slate-light/40">OFFICIAL VERIFICATION DIGITAL SIGN</div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
