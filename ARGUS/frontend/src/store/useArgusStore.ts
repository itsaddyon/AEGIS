import { create } from 'zustand'
import type { CaseFile } from '@/lib/types'
import { normalizeCaseFile } from '@/lib/types'
import type { LiveEvent } from '@/lib/monitoringTypes'

interface LivePacket {
  source_ip: string
  destination_ip: string
  protocol: string
  source_port?: number
  destination_port?: number
  bytes?: number
}

interface ArgusState {
  packets: LivePacket[]
  cases: CaseFile[]
  telemetry: LiveEvent[]
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  monitoringActive: boolean
  casesLoaded: boolean
  addPacket: (packet: LivePacket) => void
  addPacketsBatch: (newPacketsList: LivePacket[]) => void
  addCase: (caseFile: CaseFile) => void
  addCasesBatch: (newCasesList: CaseFile[]) => void
  setCases: (cases: CaseFile[]) => void
  addTelemetry: (events: LiveEvent[]) => void
  toggleMonitoring: () => void
  fetchCases: () => void
}

export const useArgusStore = create<ArgusState>((set, get) => ({
  packets: [],
  cases: [],
  telemetry: [],
  threatLevel: 'low',
  monitoringActive: true,
  casesLoaded: false,
  
  addPacket: (packet) => set((state) => {
    if (!state.monitoringActive) return state
    const newPackets = [...state.packets, packet]
    if (newPackets.length > 50) return { packets: newPackets.slice(newPackets.length - 50) }
    return { packets: newPackets }
  }),

  addPacketsBatch: (newPacketsList) => set((state) => {
    if (!state.monitoringActive || newPacketsList.length === 0) return state
    const combined = [...state.packets, ...newPacketsList]
    const trimmed = combined.length > 50 ? combined.slice(combined.length - 50) : combined
    return { packets: trimmed }
  }),
  
  addCase: (caseFile) => set((state) => {
    let newThreatLevel = state.threatLevel
    if (caseFile.severity === 'critical') newThreatLevel = 'critical'
    else if (caseFile.severity === 'high' && state.threatLevel !== 'critical') newThreatLevel = 'high'
    else if (caseFile.severity === 'medium' && state.threatLevel === 'low') newThreatLevel = 'medium'
    
    // Deduplicate by case id
    const exists = state.cases.some(c => c.id === caseFile.id)
    if (exists) return { threatLevel: newThreatLevel }

    return {
      cases: [caseFile, ...state.cases].slice(0, 200),
      threatLevel: newThreatLevel
    }
  }),

  addCasesBatch: (newCasesList) => set((state) => {
    if (newCasesList.length === 0) return state
    let newThreatLevel = state.threatLevel
    for (const c of newCasesList) {
      if (c.severity === 'critical') newThreatLevel = 'critical'
      else if (c.severity === 'high' && newThreatLevel !== 'critical') newThreatLevel = 'high'
      else if (c.severity === 'medium' && newThreatLevel === 'low') newThreatLevel = 'medium'
    }
    // Deduplicate
    const existingIds = new Set(state.cases.map(c => c.id))
    const deduped = newCasesList.filter(c => !existingIds.has(c.id))
    const combinedCases = [...deduped.reverse(), ...state.cases].slice(0, 200)
    return {
      cases: combinedCases,
      threatLevel: newThreatLevel
    }
  }),

  setCases: (cases) => set(() => {
    let tl: 'low' | 'medium' | 'high' | 'critical' = 'low'
    for (const c of cases) {
      if (c.severity === 'critical') { tl = 'critical'; break }
      if (c.severity === 'high') tl = 'high'
      else if (c.severity === 'medium' && tl === 'low') tl = 'medium'
    }
    return { cases, threatLevel: tl, casesLoaded: true }
  }),

  addTelemetry: (events) => set((state) => {
    const combined = [...events, ...state.telemetry].slice(0, 200)
    return { telemetry: combined }
  }),
  
  toggleMonitoring: () => set((state) => ({ monitoringActive: !state.monitoringActive })),

  fetchCases: () => {
    if (get().casesLoaded) return
    const poll = () => {
      if (window.pywebview?.api?.list_cases) {
        window.pywebview.api.list_cases().then((raw: string) => {
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
              const normalized = parsed.map(normalizeCaseFile)
              get().setCases(normalized)
            }
          } catch { /* ignore parse errors */ }
        }).catch(() => {})
      } else {
        setTimeout(poll, 300)
      }
    }
    poll()
  },
}))

// Wire up the Python bridge
if (typeof window !== 'undefined') {
  ;(window as any).onLivePacket = (packet: LivePacket) => {
    useArgusStore.getState().addPacket(packet)
  }

  ;(window as any).onLivePacketBatch = (packetsBatch: LivePacket[]) => {
    useArgusStore.getState().addPacketsBatch(packetsBatch)
  }
  
  ;(window as any).onNewAlert = (caseRaw: any) => {
    const normalized = normalizeCaseFile(caseRaw)
    useArgusStore.getState().addCase(normalized)
  }

  ;(window as any).onNewAlertBatch = (casesBatch: any[]) => {
    const normalized = casesBatch.map(normalizeCaseFile)
    useArgusStore.getState().addCasesBatch(normalized)
  }

  ;(window as any).onTelemetry = (events: LiveEvent[]) => {
    useArgusStore.getState().addTelemetry(events)
  }

  // Auto-load persisted cases from SQLite on startup
  useArgusStore.getState().fetchCases()
}
