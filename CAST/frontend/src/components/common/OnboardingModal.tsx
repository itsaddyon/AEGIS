import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'

export function OnboardingModal({ onDone }: { onDone: () => void }) {
  const setDisplayName = useAppStore((s) => s.setDisplayName)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name to continue.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await setDisplayName(trimmed)
      try {
        localStorage.setItem('cast_onboarded', 'true')
      } catch {
        // ignore storage failures
      }
      onDone()
    } catch (err) {
      setError('Could not save your name. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0C0E]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141517] p-8 shadow-[0_0_60px_rgba(63,125,119,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal/20 via-teal to-teal/20" />

        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-xl bg-teal/10 border border-teal/20 text-teal shadow-[0_0_15px_rgba(45,212,191,0.15)]">
            <ShieldCheck size={28} />
          </div>
        </div>

        <h2 className="text-center text-xl font-bold text-[#EFEDE6] tracking-tight">
          Welcome to CAST
        </h2>
        <p className="mt-2 text-center text-xs text-slate-light leading-relaxed">
          Before you begin your Cyber Awareness training, tell us your name.
          It will appear on your dashboard and every certificate you earn.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            maxLength={60}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#EFEDE6]
              placeholder:text-slate-light/50 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal/40"
          />

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}

          <Button type="submit" disabled={saving} className="w-full justify-center">
            {saving ? 'Saving...' : 'Start Training'}
          </Button>
        </form>
      </div>
    </div>
  )
}
