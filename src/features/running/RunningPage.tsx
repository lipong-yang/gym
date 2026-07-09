import { useMemo, useRef, useState } from 'react'
import { useLiveRunStore, computeSplits } from '@/store/liveRunStore'
import {
  parseGpx,
  useDeleteRun,
  useRuns,
  useSaveRun,
  type NewRun,
} from '@/data/running'
import { RunMap } from './RunMap'
import { RunDetail } from './RunDetail'
import {
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  StatTile,
} from '@/components/ui'
import {
  elevationGain,
  estimateCalories,
  fmtDate,
  fmtDistance,
  fmtDuration,
  fmtPace,
  pathDistance,
} from '@/lib/utils'
import type { Run } from '@/lib/types'

function useWeightKg(): [number, (n: number) => void] {
  const [w, setW] = useState(() => Number(localStorage.getItem('gt-weight')) || 70)
  const set = (n: number) => {
    setW(n)
    localStorage.setItem('gt-weight', String(n))
  }
  return [w, set]
}

function TrackTab() {
  const run = useLiveRunStore()
  const save = useSaveRun()
  const [weightKg, setWeightKg] = useWeightKg()
  const fileRef = useRef<HTMLInputElement>(null)

  const calories = estimateCalories(run.distanceM, weightKg)

  async function saveLive() {
    const splits = computeSplits(run.points)
    const payload: NewRun = {
      name: `Run ${fmtDate(new Date().toISOString())}`,
      notes: '',
      distance_m: run.distanceM,
      duration_sec: run.durationSec,
      elev_gain_m: elevationGain(run.points),
      calories_kcal: calories,
      splits,
      points: run.points,
      source: 'live',
    }
    await save.mutateAsync(payload)
    run.reset()
  }

  async function importGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const points = parseGpx(await file.text())
    if (points.length < 2) return
    const distance = pathDistance(points)
    const dur =
      points[0].ts && points[points.length - 1].ts
        ? Math.round((points[points.length - 1].ts! - points[0].ts!) / 1000)
        : 0
    const splits = computeSplits(points)
    await save.mutateAsync({
      name: file.name.replace(/\.gpx$/i, ''),
      notes: '',
      distance_m: distance,
      duration_sec: dur,
      elev_gain_m: elevationGain(points),
      calories_kcal: estimateCalories(distance, weightKg),
      splits,
      points,
      source: 'gpx-import',
    })
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {run.error && (
        <Card className="border-danger/40">
          <p className="text-sm text-danger">{run.error}</p>
        </Card>
      )}

      <Card>
        <RunMap points={run.points} follow height={240} />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Distance" value={fmtDistance(run.distanceM)} accent="primary" />
          <StatTile label="Time" value={fmtDuration(run.durationSec)} />
          <StatTile label="Pace" value={fmtPace(run.distanceM, run.durationSec)} accent="success" />
          <StatTile label="Calories" value={Math.round(calories)} accent="warning" />
        </div>
        {run.accuracy != null && (
          <p className="mt-2 text-center text-[11px] text-muted">
            GPS accuracy ±{Math.round(run.accuracy)}m
          </p>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {run.status === 'idle' ? (
            <Button onClick={run.start}>▶ Start run</Button>
          ) : (
            <>
              {run.status === 'tracking' ? (
                <Button variant="secondary" onClick={run.pause}>
                  ⏸ Pause
                </Button>
              ) : (
                <Button onClick={run.resume}>▶ Resume</Button>
              )}
              <Button
                onClick={saveLive}
                disabled={save.isPending || run.points.length < 2}
              >
                ⏹ Finish & save
              </Button>
              <Button variant="ghost" onClick={run.reset}>
                Discard
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card title="Settings & import">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Body weight (kg) — for calories
            </span>
            <Input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(+e.target.value)}
              className="w-32"
            />
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".gpx"
            hidden
            onChange={importGpx}
          />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            ⬆ Import GPX
          </Button>
        </div>
      </Card>
    </div>
  )
}

function HistoryTab({ onOpen }: { onOpen: (run: Run) => void }) {
  const runs = useRuns()
  const del = useDeleteRun()
  const data = runs.data ?? []

  if (runs.isLoading) return <EmptyState>Loading…</EmptyState>
  if (data.length === 0)
    return (
      <Card>
        <EmptyState>No runs yet — track one or import a GPX file.</EmptyState>
      </Card>
    )

  return (
    <div className="space-y-2">
      {data.map((r) => (
        <Card key={r.id} className="!p-3">
          <div className="flex items-center justify-between gap-3">
            <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(r)}>
              <div className="truncate text-sm font-semibold text-text">
                {r.name}
              </div>
              <div className="text-xs text-muted">
                {fmtDate(r.date)} · {fmtDistance(r.distance_m)} ·{' '}
                {fmtDuration(r.duration_sec)} · {fmtPace(r.distance_m, r.duration_sec)}
              </div>
            </button>
            <button
              onClick={() => del.mutate(r.id)}
              className="px-1.5 text-muted hover:text-danger"
            >
              ✕
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function RunningPage() {
  const [tab, setTab] = useState<'track' | 'history'>('track')
  const [selected, setSelected] = useState<Run | null>(null)

  const subTabs = useMemo(
    () => [
      { id: 'track' as const, label: '🏃 Track' },
      { id: 'history' as const, label: '📜 History' },
    ],
    [],
  )

  if (selected)
    return <RunDetail run={selected} onBack={() => setSelected(null)} />

  return (
    <div className="space-y-4">
      <PageHeader title="Running" subtitle="Live GPS tracking & history" />

      <div className="flex gap-2">
        {subTabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'track' ? (
        <TrackTab />
      ) : (
        <HistoryTab onOpen={setSelected} />
      )}
    </div>
  )
}
