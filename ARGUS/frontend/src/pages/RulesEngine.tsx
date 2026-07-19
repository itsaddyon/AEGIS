import { useState } from 'react'
import { Upload, Plus, ShieldAlert } from 'lucide-react'
import { RuleRow } from '@/components/rules/RuleRow'
import { mockRules, type DetectionRule } from '@/lib/rulesTypes'

export function RulesEngine() {
  const [rules, setRules] = useState<DetectionRule[]>(mockRules)
  const [toast, setToast] = useState<string | null>(null)

  function toggle(id: string, enabled: boolean) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled, updatedAt: new Date().toISOString() } : r)))
  }

  function duplicate(id: string) {
    const source = rules.find((r) => r.id === id)
    if (!source) return
    const copy: DetectionRule = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRules((rs) => [...rs, copy])
  }

  function remove(id: string) {
    setRules((rs) => rs.filter((r) => r.id !== id))
  }

  function test(id: string) {
    // Phase 2: calls window.pywebview.api.test_rule(id) against replayed sample events.
    setToast(`Running "${rules.find((r) => r.id === id)?.name}" against sample traffic — wire-up pending.`)
  }

  function edit(id: string) {
    // Phase 2: opens a rule editor modal bound to this rule's parameters.
    setToast(`Editing "${rules.find((r) => r.id === id)?.name}" — rule editor modal pending.`)
  }

  function exportRule(id: string) {
    const rule = rules.find((r) => r.id === id)
    if (!rule) return
    const blob = new Blob([JSON.stringify(rule, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${rule.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Rules Engine</h1>
          <p className="text-sm text-slate mt-1">Enable, tune, and test the rules driving ARGUS's detections.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border
                              dark:border-border-dark text-sm text-slate hover:bg-surface-muted">
            <Upload className="w-4 h-4" /> Import Rule
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-teal text-white text-sm hover:bg-teal-muted">
            <Plus className="w-4 h-4" /> New Rule
          </button>
        </div>
      </div>

      {toast && (
        <div className="aegis-card p-3 flex items-center gap-2 text-sm bg-teal-soft/40 border-teal/20">
          <ShieldAlert className="w-4 h-4 text-forest shrink-0" />
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-xs text-slate hover:text-charcoal">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rules.map((r) => (
          <RuleRow
            key={r.id}
            rule={r}
            onToggle={toggle}
            onDuplicate={duplicate}
            onDelete={remove}
            onTest={test}
            onEdit={edit}
            onExport={exportRule}
          />
        ))}
        {rules.length === 0 && (
          <div className="text-center text-sm text-slate py-12">No rules yet — create one to get started.</div>
        )}
      </div>
    </div>
  )
}
