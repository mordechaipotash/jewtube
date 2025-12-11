import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Video } from './api'

interface AuthState {
  user: { id: string; email: string } | null
  setUser: (user: { id: string; email: string } | null) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

interface PlayerState {
  currentVideo: Video | null
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  speed: number
  setCurrentVideo: (video: Video | null) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setSpeed: (speed: number) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentVideo: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: 1,
      speed: 1,
      setCurrentVideo: (video) => set({ currentVideo: video, progress: 0 }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      setSpeed: (speed) => set({ speed }),
    }),
    {
      name: 'jewtube-player',
      partialize: (state) => ({ volume: state.volume, speed: state.speed }),
    }
  )
)

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'jewtube-theme' }
  )
)
