import { create } from 'zustand'

export type Phase = 'idle' | 'warmup' | 'work' | 'rest' | 'done'

export interface TimerConfig {
  warmupSec: number
  workSec: number
  restSec: number
  rounds: number
}

interface TimerState extends TimerConfig {
  phase: Phase
  round: number // 1-based current work round
  secondsLeft: number
  running: boolean
  configure: (c: Partial<TimerConfig>) => void
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
}

// --- audio / voice cues ----------------------------------------------------
let audioCtx: AudioContext | null = null
function beep(freq = 880, ms = 120) {
  try {
    audioCtx ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000)
    osc.stop(audioCtx.currentTime + ms / 1000)
  } catch {
    /* audio may be blocked until a user gesture */
  }
}

function say(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.05
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    /* speech unsupported */
  }
}

function firstPhase(s: TimerConfig): { phase: Phase; secondsLeft: number } {
  return s.warmupSec > 0
    ? { phase: 'warmup', secondsLeft: s.warmupSec }
    : { phase: 'work', secondsLeft: s.workSec }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  warmupSec: 10,
  workSec: 30,
  restSec: 15,
  rounds: 8,
  phase: 'idle',
  round: 1,
  secondsLeft: 30,
  running: false,

  configure: (c) =>
    set((s) => {
      if (s.running) return s
      const next = { ...s, ...c }
      return {
        ...next,
        phase: 'idle',
        round: 1,
        secondsLeft: firstPhase(next).secondsLeft,
      }
    }),

  start: () => {
    const s = get()
    const fp = firstPhase(s)
    set({ ...fp, round: 1, running: true })
    say(fp.phase === 'warmup' ? 'Warm up' : 'Go')
  },

  pause: () => set({ running: false }),
  resume: () => set({ running: true }),

  reset: () => {
    speechSynthesis.cancel?.()
    set((s) => ({
      phase: 'idle',
      round: 1,
      running: false,
      secondsLeft: firstPhase(s).secondsLeft,
    }))
  },

  tick: () => {
    const s = get()
    if (!s.running) return

    if (s.secondsLeft > 1) {
      if (s.secondsLeft <= 4) beep(660, 90) // 3-2-1 countdown
      set({ secondsLeft: s.secondsLeft - 1 })
      return
    }

    // Phase boundary reached.
    beep(990, 200)
    if (s.phase === 'warmup') {
      say('Go')
      set({ phase: 'work', secondsLeft: s.workSec })
    } else if (s.phase === 'work') {
      if (s.round >= s.rounds) {
        say('Workout complete')
        set({ phase: 'done', running: false, secondsLeft: 0 })
      } else if (s.restSec > 0) {
        say('Rest')
        set({ phase: 'rest', secondsLeft: s.restSec })
      } else {
        say('Go')
        set({ round: s.round + 1, phase: 'work', secondsLeft: s.workSec })
      }
    } else if (s.phase === 'rest') {
      say('Go')
      set({ round: s.round + 1, phase: 'work', secondsLeft: s.workSec })
    }
  },
}))
