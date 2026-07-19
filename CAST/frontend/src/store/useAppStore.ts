import { create } from 'zustand'
import { getApi } from '@/lib/api'
import type { Profile, MissionProgress, Achievement, Simulation } from '@/types'

interface AppState {
  profile: Profile | null
  missions: MissionProgress[]
  achievements: Achievement[]
  simulations: Simulation[]
  loading: boolean
  refreshAll: () => Promise<void>
  setTheme: (theme: 'dark' | 'light') => Promise<void>
  setDisplayName: (name: string) => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  missions: [],
  achievements: [],
  simulations: [],
  loading: true,

  refreshAll: async () => {
    const api = getApi()
    const [profile, missions, achievements, simulations] = await Promise.all([
      api.get_profile(), api.get_missions(), api.get_achievements(), api.get_simulations(),
    ])
    set({ profile, missions, achievements, simulations, loading: false })
  },


  setTheme: async (theme) => {
    const api = getApi()
    const profile = await api.set_theme(theme)
    set({ profile })
  },

  setDisplayName: async (name) => {
    const api = getApi()
    const profile = await api.update_display_name(name)
    set({ profile })
  },
}))
