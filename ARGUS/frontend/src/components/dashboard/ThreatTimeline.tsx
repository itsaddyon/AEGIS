
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useArgusStore } from '@/store/useArgusStore'

export function ThreatTimeline() {
  const packets = useArgusStore(state => state.packets)
  
  // Create a live scrolling graph using the last 50 packets
  const data = packets.map((p, i) => ({
    time: i.toString(),
    incidents: p.protocol === 'TCP' ? 2 : p.protocol === 'UDP' ? 1 : 0
  }))

  // Fill with empty data if no packets yet to keep graph structure
  if (data.length < 50) {
    for (let i = data.length; i < 50; i++) {
      data.unshift({ time: `-${50-i}`, incidents: 0 })
    }
  }

  return (
    <div className="glass-panel p-4 rounded-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-mono font-bold bg-teal/10 text-teal rounded-bl uppercase tracking-wider">
        SYS_TELEMETRY // LIVE
      </div>
      <div className="text-sm font-display font-medium text-slate dark:text-slate-light mb-3">Live Packet Stream</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3F7D77" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3F7D77" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis hide dataKey="time" />
          <YAxis hide domain={[0, 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(227, 224, 216, 0.5)', backgroundColor: 'rgba(38, 40, 44, 0.9)', color: '#EFEDE6' }}
            itemStyle={{ color: '#3F7D77' }}
          />
          <Area type="step" dataKey="incidents" stroke="#3F7D77" fill="url(#threatGradient)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
