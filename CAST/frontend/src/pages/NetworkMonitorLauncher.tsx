import { useState } from 'react'
import { Radar, ArrowUpRight, ShieldAlert, Activity, Waves, Radio } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function NetworkMonitorLauncher() {
  const [isLaunching, setIsLaunching] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLaunchVista() {
    setIsLaunching(true)
    setErrorMsg('')
    setStatusMsg('INITIATING SECURE VISTA TRANSIT BRIDGE...')

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      if (!window.pywebview?.api?.launch_vista) {
        setErrorMsg('VISTA launch bridge is only available in the packaged desktop app, not in the dev browser preview.')
        setIsLaunching(false)
        return
      }
      const data = await window.pywebview.api.launch_vista()
      if (data?.success) {
        setStatusMsg('ACCESS AUTHORIZED. OPENING VISTA...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLaunching(false)
      } else {
        setErrorMsg(data?.error || 'Failed to locate VISTA.exe or run.py.')
        setIsLaunching(false)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error while launching VISTA.')
      setIsLaunching(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-mono text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#EFEDE6] to-teal">
        NETWORK MONITOR
      </h1>
      <p className="mt-1 text-xs font-mono text-slate-light tracking-wide">
        Deep packet inspection and live traffic analysis, powered by the VISTA sniffer engine.
      </p>

      <Card className="mt-8 border-teal/20 bg-teal/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[10px] font-mono font-bold bg-teal/10 text-teal rounded-bl uppercase tracking-wider">
          Unlocked
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal/10 text-teal">
                <Radar size={22} />
              </div>
              <span className="text-[9px] font-mono font-bold text-teal uppercase tracking-wider">
                Traffic Analysis Module
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#EFEDE6]">
              V.I.S.T.A. — Visual Interactive Sniffer &amp; Traffic Analyzer
            </h3>
            <p className="text-xs text-slate-light leading-relaxed">
              Capture and inspect live network packets, decode protocols in real time, and
              monitor traffic on your interfaces. VISTA opens as its own standalone
              application alongside CAST.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-left max-w-sm flex flex-col gap-1">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Ecosystem Setup Required
          </span>
          <span className="text-slate-light text-[11px] leading-relaxed">
            This module uses Optional Ecosystem Interoperability. To launch it, you must have cloned the full AEGIS repository so all projects sit adjacently. See the <a href="https://github.com/itsaddyon/Codealpha_AEGIS" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Setup Guide</a>.
          </span>
        </div>

        <button 
            onClick={handleLaunchVista}
            className="px-5 py-2.5 bg-teal hover:bg-teal/80 text-[#0B0C0E] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(63,125,119,0.25)] whitespace-nowrap self-end md:self-auto"
          >
            Launch VISTA Network Monitor
            <ArrowUpRight size={14} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </Card>

      {/* Preview strip of what VISTA offers */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-white/5">
          <Activity size={18} className="text-teal" />
          <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">Live Packet Stream</div>
          <div className="mt-1 text-xs text-slate-light">Watch packets flow across your network in real time.</div>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <Waves size={18} className="text-teal" />
          <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">Protocol Breakdown</div>
          <div className="mt-1 text-xs text-slate-light">Decode headers, payloads, and DNS lookups per packet.</div>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <Radio size={18} className="text-teal" />
          <div className="mt-2 text-sm font-semibold text-[#EFEDE6]">Interface Selection</div>
          <div className="mt-1 text-xs text-slate-light">Choose Wi-Fi or Ethernet and start sniffing instantly.</div>
        </Card>
      </div>

      {/* Transition Dialog Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#141517] border border-white/10 p-6 rounded-lg text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal/20 via-teal to-teal/20 animate-pulse" />
            <h3 className="font-mono text-xs font-bold text-teal tracking-widest uppercase mb-4">
              {statusMsg}
            </h3>
            <p className="text-[10px] text-slate-light font-mono leading-relaxed mb-4">
              Switching execution frame into VISTA Traffic Analyzer...
            </p>
            <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-teal animate-pulse" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
