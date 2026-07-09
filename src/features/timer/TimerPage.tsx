import { useEffect } from 'react'
import { useTimerStore, type Phase } from '@/store/timerStore'
import {
  useDeleteTimerPreset,
  useSaveTimerPreset,
  useTimerPresets,
} from '@/data/timer'
import { Button, Card, Field, Input, PageHeader } from '@/components/ui'
import { classNames, fmtDuration } from '@/lib/utils'

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Ready',
  warmup: 'Warm up',
  work: 'Work',
  rest: 'Rest',
  done: 'Done',
}
const PHASE_COLOR: Record<Phase, string> = {
  idle: 'var(--primary)',
  warmup: 'var(--success)',
  work: 'var(--primary)',
  rest: 'var(--warning)',
  done: 'var(--success)',
}

interface PresetView {
  id?: string
  name: string
  warmupSec: number
  workSec: number
  restSec: number
  rounds: number
}

const BUILTIN: PresetView[] = [
  { name: 'Rope Skip', warmupSec: 10, workSec: 60, restSec: 30, rounds: 6 },
  { name: 'Tabata', warmupSec: 10, workSec: 20, restSec: 10, rounds: 8 },
  { name: 'Strength', warmupSec: 0, workSec: 45, restSec: 90, rounds: 5 },
]

function Ring({
  phase,
  fraction,
  secondsLeft,
  round,
  rounds,
}: {
  phase: Phase
  fraction: number
  secondsLeft: number
  round: number
  rounds: number
}) {
  const R = 92
  const C = 2 * Math.PI * R
  return (
    <div className="relative mx-auto h-56 w-56">
      <svg viewBox="0 0 220 220" className="-rotate-90">
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke="var(--border-c)"
          strokeWidth="12"
        />
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke={PHASE_COLOR[phase]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset .25s linear, stroke .3s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: PHASE_COLOR[phase] }}
        >
          {PHASE_LABEL[phase]}
        </span>
        <span className="text-5xl font-extrabold tabular-nums text-text">
          {fmtDuration(secondsLeft)}
        </span>
        {phase !== 'idle' && phase !== 'done' && (
          <span className="mt-1 text-xs text-muted">
            Round {round} / {rounds}
          </span>
        )}
      </div>
    </div>
  )
}

export function TimerPage() {
  const s = useTimerStore()
  const presets = useTimerPresets()
  const savePreset = useSaveTimerPreset()
  const delPreset = useDeleteTimerPreset()

  // Drive the clock while running.
  useEffect(() => {
    if (!s.running) return
    const id = setInterval(() => useTimerStore.getState().tick(), 1000)
    return () => clearInterval(id)
  }, [s.running])

  const allPresets: PresetView[] = (presets.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    warmupSec: p.warmup_sec,
    workSec: p.work_sec,
    restSec: p.rest_sec,
    rounds: p.rounds,
  }))

  const phaseTotal =
    s.phase === 'warmup'
      ? s.warmupSec
      : s.phase === 'rest'
        ? s.restSec
        : s.workSec
  const fraction = phaseTotal > 0 ? s.secondsLeft / phaseTotal : 0

  return (
    <div className="space-y-4">
      <PageHeader title="Interval Timer" subtitle="HIIT · rope · rest timer" />

      <Card>
        <Ring
          phase={s.phase}
          fraction={fraction}
          secondsLeft={s.secondsLeft}
          round={s.round}
          rounds={s.rounds}
        />
        <div className="mt-4 flex justify-center gap-2">
          {s.phase === 'idle' || s.phase === 'done' ? (
            <Button onClick={s.start}>▶ Start</Button>
          ) : s.running ? (
            <Button variant="secondary" onClick={s.pause}>
              ⏸ Pause
            </Button>
          ) : (
            <Button onClick={s.resume}>▶ Resume</Button>
          )}
          <Button variant="ghost" onClick={s.reset}>
            ↺ Reset
          </Button>
        </div>
      </Card>

      <Card title="Presets">
        <div className="flex flex-wrap gap-2">
          {[...BUILTIN, ...allPresets].map((p, i) => (
            <button
              key={p.id ?? `builtin-${i}`}
              onClick={() =>
                s.configure({
                  warmupSec: p.warmupSec,
                  workSec: p.workSec,
                  restSec: p.restSec,
                  rounds: p.rounds,
                })
              }
              className={classNames(
                'rounded-full border border-border-c bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-text',
              )}
            >
              {p.name} · {p.workSec}/{p.restSec}×{p.rounds}
              {p.id && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    delPreset.mutate(p.id!)
                  }}
                  className="ml-1.5 text-danger"
                >
                  ✕
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Configure">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Warm-up (s)">
            <Input
              type="number"
              value={s.warmupSec}
              onChange={(e) => s.configure({ warmupSec: +e.target.value })}
            />
          </Field>
          <Field label="Work (s)">
            <Input
              type="number"
              value={s.workSec}
              onChange={(e) => s.configure({ workSec: +e.target.value })}
            />
          </Field>
          <Field label="Rest (s)">
            <Input
              type="number"
              value={s.restSec}
              onChange={(e) => s.configure({ restSec: +e.target.value })}
            />
          </Field>
          <Field label="Rounds">
            <Input
              type="number"
              value={s.rounds}
              onChange={(e) => s.configure({ rounds: +e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              savePreset.mutate({
                name: `Custom ${s.workSec}/${s.restSec}`,
                warmup_sec: s.warmupSec,
                work_sec: s.workSec,
                rest_sec: s.restSec,
                rounds: s.rounds,
              })
            }
          >
            Save as preset
          </Button>
        </div>
      </Card>
    </div>
  )
}
