import type { LiveEvent, MonitorCategory } from '@/lib/monitoringTypes'
import { StatusDot } from './StatusDot'

// Column sets differ per category since a "process" row and a
// "connection" row don't share the same meaningful fields.
function columnsFor(category: MonitorCategory): { key: keyof LiveEvent; label: string }[] {
  switch (category) {
    case 'connections':
      return [
        { key: 'sourceIp', label: 'Source' }, { key: 'destinationIp', label: 'Destination' },
        { key: 'port', label: 'Port' }, { key: 'protocol', label: 'Protocol' },
      ]
    case 'ports':
      return [{ key: 'port', label: 'Port' }, { key: 'protocol', label: 'Protocol' }, { key: 'destinationIp', label: 'Host' }]
    case 'processes':
      return [{ key: 'processName', label: 'Process' }, { key: 'pid', label: 'PID' }, { key: 'destinationIp', label: 'Remote IP' }]
    case 'devices':
      return [{ key: 'deviceName', label: 'Device' }, { key: 'macAddress', label: 'MAC Address' }, { key: 'sourceIp', label: 'IP' }]
    case 'traffic':
    case 'packets':
      return [
        { key: 'sourceIp', label: 'Source' }, { key: 'destinationIp', label: 'Destination' },
        { key: 'protocol', label: 'Protocol' }, { key: 'bytes', label: 'Bytes' },
      ]
    case 'suspicious':
    default:
      return [
        { key: 'sourceIp', label: 'Source' }, { key: 'destinationIp', label: 'Destination' },
        { key: 'protocol', label: 'Protocol' }, { key: 'detail', label: 'Reason' },
      ]
  }
}

export function EventTable({ category, events }: { category: MonitorCategory; events: LiveEvent[] }) {
  const columns = columnsFor(category)

  return (
    <div className="glass-panel overflow-hidden rounded-lg shadow-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border dark:border-border-dark text-left text-xs text-slate">
            <th className="px-3 py-2 font-medium">Time</th>
            {columns.map((c) => <th key={String(c.key)} className="px-3 py-2 font-medium">{c.label}</th>)}
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-border-dark">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-surface-muted dark:hover:bg-graphite/40 transition-colors">
              <td className="px-3 py-2 text-xs text-slate-light whitespace-nowrap">
                {new Date(e.timestamp).toLocaleTimeString()}
              </td>
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-2 whitespace-nowrap">{String(e[c.key] ?? '—')}</td>
              ))}
              <td className="px-3 py-2"><StatusDot status={e.status} /></td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr><td colSpan={columns.length + 2} className="text-center text-slate py-8 text-sm">No events yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
