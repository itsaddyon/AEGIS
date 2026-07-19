import { create } from 'zustand'
import type { CaseFile } from '@/lib/types'

interface LivePacket {
  source_ip: string
  destination_ip: string
  protocol: string
}

interface ArgusState {
  packets: LivePacket[]
  cases: CaseFile[]
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  monitoringActive: boolean
  addPacket: (packet: LivePacket) => void
  addCase: (caseFile: CaseFile) => void
  toggleMonitoring: () => void
}

export const useArgusStore = create<ArgusState>((set) => ({
  packets: [],
  cases: [],
  threatLevel: 'low',
  monitoringActive: true,
  
  addPacket: (packet) => set((state) => {
    if (!state.monitoringActive) return state
    const newPackets = [...state.packets, packet]
    if (newPackets.length > 50) newPackets.shift() // Keep last 50 packets for live graph
    return { packets: newPackets }
  }),
  
  addCase: (caseFile) => set((state) => {
    // Automatically elevate threat level when high severity cases come in
    let newThreatLevel = state.threatLevel
    if (caseFile.severity === 'critical') newThreatLevel = 'critical'
    else if (caseFile.severity === 'high' && state.threatLevel !== 'critical') newThreatLevel = 'high'
    else if (caseFile.severity === 'medium' && state.threatLevel === 'low') newThreatLevel = 'medium'
    
    return {
      cases: [caseFile, ...state.cases].slice(0, 50), // Keep 50 recent alerts in memory
      threatLevel: newThreatLevel
    }
  }),
  
  toggleMonitoring: () => set((state) => ({ monitoringActive: !state.monitoringActive }))
}))

// Wire up the Python bridge
if (typeof window !== 'undefined') {
  ;(window as any).onLivePacket = (packet: LivePacket) => {
    useArgusStore.getState().addPacket(packet)
  }
  
  ;(window as any).onNewAlert = (caseFile: CaseFile) => {
    useArgusStore.getState().addCase(caseFile)
  }
}
