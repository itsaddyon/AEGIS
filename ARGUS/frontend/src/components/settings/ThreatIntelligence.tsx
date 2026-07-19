import { ShieldCheck, RefreshCw, Key, Database } from 'lucide-react'

export function ThreatIntelligence() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1">Threat Intelligence</h2>
        <p className="text-sm text-slate-light">Manage connected threat feeds, IOC databases, and STIX/TAXII integrations.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Feed 1 */}
        <div className="glass-panel p-4 rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-teal/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal" />
              </div>
              <div>
                <div className="font-semibold text-sm">AEGIS Global Sentinel</div>
                <div className="text-xs text-teal font-mono mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  SYNCED (Just now)
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-surface-muted dark:hover:bg-charcoal rounded text-slate transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-light leading-relaxed">
            The primary, real-time threat intelligence feed provided by the AEGIS network. Contains 
            over 4.2 million active IOCs (Indicators of Compromise).
          </p>
        </div>

        {/* Feed 2 */}
        <div className="glass-panel p-4 rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="font-semibold text-sm">OSINT Emerging Threats</div>
                <div className="text-xs text-warning font-mono mt-0.5">
                  SYNCED (2 hrs ago)
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-surface-muted dark:hover:bg-charcoal rounded text-slate transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-light leading-relaxed">
            Open-source intelligence aggregates covering newly discovered botnets, ransomware domains, and known malicious exit nodes.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-slate">Custom Integrations</h3>
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-dashed border-2 border-border dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-muted dark:bg-charcoal flex items-center justify-center border border-border dark:border-border-dark">
              <Key className="w-4 h-4 text-slate" />
            </div>
            <div>
              <div className="font-semibold text-sm">Add Custom STIX/TAXII Server</div>
              <div className="text-xs text-slate-light">Connect ARGUS to your organization's private threat database</div>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded bg-charcoal dark:bg-surface text-canvas dark:text-charcoal text-xs font-semibold">
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
