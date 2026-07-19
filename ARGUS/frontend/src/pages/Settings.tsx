import { useState } from 'react'
import { Settings as SettingsIcon, ShieldAlert, ListChecks, Webhook } from 'lucide-react'
import { GeneralPreferences } from '@/components/settings/GeneralPreferences'
import { ThreatIntelligence } from '@/components/settings/ThreatIntelligence'
import { RulesEngine } from '@/pages/RulesEngine'

type Tab = 'general' | 'intelligence' | 'rules' | 'api'

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-80px)] gap-8">
      {/* Settings Sidebar */}
      <div className="w-64 flex flex-col gap-1 border-r border-border dark:border-border-dark pr-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Settings</h1>
        
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
            activeTab === 'general' ? 'bg-teal/10 text-teal font-semibold' : 'text-slate hover:bg-surface-muted dark:hover:bg-charcoal'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          General Preferences
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
            activeTab === 'rules' ? 'bg-teal/10 text-teal font-semibold' : 'text-slate hover:bg-surface-muted dark:hover:bg-charcoal'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Rules Engine
        </button>

        <button
          onClick={() => setActiveTab('intelligence')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
            activeTab === 'intelligence' ? 'bg-teal/10 text-teal font-semibold' : 'text-slate hover:bg-surface-muted dark:hover:bg-charcoal'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Threat Intelligence
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
            activeTab === 'api' ? 'bg-teal/10 text-teal font-semibold' : 'text-slate hover:bg-surface-muted dark:hover:bg-charcoal'
          }`}
        >
          <Webhook className="w-4 h-4" />
          API & Webhooks
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto py-2 pr-4">
        {activeTab === 'general' && <GeneralPreferences />}
        {activeTab === 'rules' && (
          <div className="-mt-6">
            {/* RulesEngine expects to be a full page, so we negate its top margin slightly to fit here */}
            <RulesEngine />
          </div>
        )}
        {activeTab === 'intelligence' && <ThreatIntelligence />}
        {activeTab === 'api' && (
          <div>
            <h2 className="text-xl font-display font-semibold mb-1">API & Webhooks</h2>
            <p className="text-sm text-slate-light mb-6">Configure outbound webhooks for automated incident response (SOAR).</p>
            <div className="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center border-dashed border-2 border-border dark:border-border-dark text-slate-light">
              <Webhook className="w-10 h-10 mb-3 opacity-50" />
              <div className="font-semibold text-charcoal dark:text-canvas mb-1">No Webhooks Configured</div>
              <div className="text-xs max-w-sm">
                You can configure ARGUS to send HTTP POST payloads to external systems (like Slack, PagerDuty, or Phantom) whenever a Critical case file is generated.
              </div>
              <button className="mt-4 px-4 py-2 bg-charcoal dark:bg-surface text-canvas dark:text-charcoal rounded text-sm font-semibold">
                Add Webhook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
