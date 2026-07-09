import { create } from 'zustand'
import { haversine } from '@/lib/utils'
import type { RunPoint } from '@/lib/types'

export type TrackStatus = 'idle' | 'tracking' | 'paused'

interface LiveRunState {
  status: TrackStatus
  points: RunPoint[]
  distanceM: number
  durationSec: number
  accuracy: number | null
  error: string | null
  watchId: number | null
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
}

// Store-managed 1 Hz ticker so elapsed time advances with GPS points regardless
// of which screen is mounted (prevents distance/duration desync).
let durationTimer: ReturnType<typeof setInterval> | null = null
function startTicking() {
  if (durationTimer) return
  durationTimer = setInterval(() => {
    if (useLiveRunStore.getState().status === 'tracking')
      useLiveRunStore.setState((s) => ({ durationSec: s.durationSec + 1 }))
  }, 1000)
}
function stopTicking() {
  if (durationTimer) clearInterval(durationTimer)
  durationTimer = null
}

function handlePosition(pos: GeolocationPosition) {
  const st = useLiveRunStore.getState()
  if (st.status !== 'tracking') return
  const { latitude, longitude, altitude, accuracy } = pos.coords
  const p: RunPoint = {
    lat: latitude,
    lng: longitude,
    alt: altitude ?? null,
    ts: pos.timestamp,
  }
  // Skip very inaccurate fixes and jitter under 2 m.
  if (accuracy > 40) {
    useLiveRunStore.setState({ accuracy })
    return
  }
  const prev = st.points[st.points.length - 1]
  const added = prev ? haversine(prev, p) : 0
  if (prev && added < 2) {
    useLiveRunStore.setState({ accuracy })
    return
  }
  useLiveRunStore.setState({
    points: [...st.points, p],
    distanceM: st.distanceM + added,
    accuracy,
  })
}

function handleError(err: GeolocationPositionError) {
  useLiveRunStore.setState({ error: err.message })
}

export const useLiveRunStore = create<LiveRunState>((set, get) => ({
  status: 'idle',
  points: [],
  distanceM: 0,
  durationSec: 0,
  accuracy: null,
  error: null,
  watchId: null,

  start: () => {
    if (!('geolocation' in navigator)) {
      set({ error: 'Geolocation is not available on this device.' })
      return
    }
    if (!window.isSecureContext) {
      set({ error: 'GPS needs HTTPS (or localhost). Deploy or use localhost.' })
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    )
    set({
      status: 'tracking',
      points: [],
      distanceM: 0,
      durationSec: 0,
      error: null,
      watchId,
    })
    startTicking()
  },

  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'tracking' }),

  stop: () => {
    const { watchId } = get()
    if (watchId != null) navigator.geolocation.clearWatch(watchId)
    stopTicking()
    set({ status: 'idle', watchId: null })
  },

  reset: () => {
    const { watchId } = get()
    if (watchId != null) navigator.geolocation.clearWatch(watchId)
    stopTicking()
    set({
      status: 'idle',
      points: [],
      distanceM: 0,
      durationSec: 0,
      accuracy: null,
      error: null,
      watchId: null,
    })
  },
}))

/** Compute per-km splits (seconds per km) from tracked points. */
export function computeSplits(points: RunPoint[]): { km: number; sec: number }[] {
  const splits: { km: number; sec: number }[] = []
  let dist = 0
  let kmMark = 1
  let kmStartTs = points[0]?.ts ?? 0
  for (let i = 1; i < points.length; i++) {
    dist += haversine(points[i - 1], points[i])
    while (dist >= kmMark * 1000) {
      const ts = points[i].ts ?? 0
      splits.push({ km: kmMark, sec: Math.round((ts - kmStartTs) / 1000) })
      kmStartTs = ts
      kmMark++
    }
  }
  return splits
}
