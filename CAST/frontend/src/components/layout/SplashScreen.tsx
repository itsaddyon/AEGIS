import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=[]{}|;:<>?/\\'

const BOOT_LOGS = [
  'INITIALIZING CAST SECURITY TRAINING SUITE...',
  'HOOKING LOCAL SQLite ENGINE...',
  'VALIDATING INTERACTIVE LESSONS SCHEMA...',
  'ESTABLISHING PRACTICE LAB ENVIRONMENTS...',
  'LOADING USER PROGRESS PROFILE...',
  'DESIGNED & DEVELOPED BY ADARSH ARYA...',
  'CAST TUTORIAL IS ONLINE.'
]

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const targetWord = 'CAST'
  const fullForm = 'Cyber Awareness Simulation Trainer'

  const [displayWord, setDisplayWord] = useState('')
  const [visibleLogs, setVisibleLogs] = useState<string[]>([])
  const [showFullForm, setShowFullForm] = useState(false)
  const [bootProgress, setBootProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  // Scramble title animation
  useEffect(() => {
    let iterations = 0
    const maxIterations = 30
    const intervalTime = 50

    const interval = setInterval(() => {
      const current = targetWord.split('').map((char, index) => {
        const resolveAt = Math.floor((maxIterations / targetWord.length) * (index + 1))
        if (iterations >= resolveAt) {
          return char
        }
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join('')

      setDisplayWord(current)
      iterations++

      if (iterations >= maxIterations) {
        clearInterval(interval)
        setDisplayWord(targetWord)

        setTimeout(() => {
          setShowFullForm(true)
        }, 200)
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [])

  // Boot progress and log ticker animation
  useEffect(() => {
    let logIdx = 0
    const logInterval = setInterval(() => {
      if (logIdx < BOOT_LOGS.length) {
        setVisibleLogs((prev) => [...prev, BOOT_LOGS[logIdx]])
        setBootProgress(Math.floor(((logIdx + 1) / BOOT_LOGS.length) * 100))
        logIdx++
      } else {
        clearInterval(logInterval)

        setTimeout(() => {
          setFadeOut(true)
          setTimeout(() => {
            onDone()
          }, 800)
        }, 1200)
      }
    }, 500)

    return () => clearInterval(logInterval)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C0E] text-white select-none transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a604_1px,transparent_1px),linear-gradient(to_bottom,#14b8a604_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

      {/* Radial backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,125,119,0.12)_0%,#0B0C0E_70%)] pointer-events-none"></div>

      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none"></div>

      {/* Frame Brackets */}
      <div className="w-[85vw] max-w-4xl h-[70vh] flex flex-col justify-between border border-teal/5 bg-[#1E1F22]/30 backdrop-blur-md p-6 md:p-10 rounded-lg relative shadow-[0_0_50px_rgba(0,0,0,0.6)] pb-12 md:pb-16">
        {/* Top-Left Bracket */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal -mt-0.5 -ml-0.5"></div>
        {/* Top-Right Bracket */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal -mt-0.5 -mr-0.5"></div>
        {/* Bottom-Left Bracket */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal -mb-0.5 -ml-0.5"></div>
        {/* Bottom-Right Bracket */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal -mb-0.5 -mr-0.5"></div>

        {/* Top HUD bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-teal/40 tracking-widest uppercase border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="animate-pulse" size={12} />
            <span>SYSTEM LINK: ACTIVE</span>
          </div>
          <div>CAST // VERSION: 1.0.0</div>
        </div>

        {/* Center Main Presentation: Scrambling Title */}
        <div className="flex-1 flex flex-col items-center justify-center my-6">
          <div className="text-6xl md:text-8xl font-black font-mono tracking-[0.25em] pl-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-[#EFEDE6] to-teal drop-shadow-[0_0_20px_rgba(63,125,119,0.35)] select-none">
            {displayWord}
          </div>

          {/* Subtitle Full Form & Blinking Status */}
          <div className="h-12 mt-4 flex flex-col items-center justify-start gap-1.5">
            <div
              className={`text-xs md:text-sm font-semibold font-mono tracking-wider text-slate-light text-center transition-all duration-700 transform ${
                showFullForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              {fullForm}
            </div>
            {showFullForm && (
              <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-teal/70 animate-pulse mt-0.5">
                {bootProgress < 100 ? (
                  <span>LOADING INTERFACE...</span>
                ) : (
                  <span className="text-emerald-500 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">SYSTEM READY</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Logs Console and Progress Meter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6">
          {/* Logs Console (Takes 2 cols) */}
          <div className="md:col-span-2 flex flex-col justify-end space-y-1.5 font-mono text-[9px] text-[#889096] h-20 overflow-hidden leading-tight">
            {visibleLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-teal">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
            {visibleLogs.length < BOOT_LOGS.length && (
              <div className="flex items-center gap-1">
                <span className="text-teal animate-pulse">&gt;</span>
                <span className="w-1.5 h-3 bg-teal/60 animate-pulse"></span>
              </div>
            )}
          </div>

          {/* Progress Meter (Takes 1 col) */}
          <div className="flex flex-col justify-end font-mono">
            <div className="flex justify-between text-[10px] text-teal/60 mb-2">
              <span>BOOT SEQUENCE</span>
              <span>{Math.min(bootProgress, 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-teal to-[#52a39c] transition-all duration-150 ease-out"
                style={{ width: `${Math.min(bootProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Designer & Developer Signature Credits */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[9px] font-mono tracking-[0.22em] text-teal/30 uppercase text-center w-full">
          DESIGNED &amp; DEVELOPED BY <span className="text-teal/70 font-bold drop-shadow-[0_0_6px_rgba(63,125,119,0.35)]">ADARSH ARYA</span>
        </div>
      </div>
    </div>
  )
}
