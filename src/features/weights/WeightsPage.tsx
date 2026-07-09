import { useMemo, useState } from 'react'
import {
  useAddWeightExercise,
  useDeleteWeightExercise,
  useLogWeightSession,
  useWeightExercises,
  useWeightLogs,
} from '@/data/weights'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
} from '@/components/ui'
import { TrendLine } from '@/components/Charts'
import { fmtDate } from '@/lib/utils'
import type { WeightExercise } from '@/lib/types'

function ExercisePanel({ ex }: { ex: WeightExercise }) {
  const logs = useWeightLogs(ex.id)
  const logSession = useLogWeightSession()
  const [sets, setSets] = useState([{ reps: '', kg: '' }])

  const chartData = useMemo(() => {
    return (logs.data ?? []).map((log) => {
      const top = Math.max(0, ...(log.weight_sets ?? []).map((s) => s.kg))
      return { date: fmtDate(log.date).replace(/,.*/, ''), kg: top }
    })
  }, [logs.data])

  function updateSet(i: number, field: 'reps' | 'kg', v: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)))
  }

  function save() {
    const parsed = sets
      .map((s) => ({ reps: +s.reps || 0, kg: +s.kg || 0 }))
      .filter((s) => s.reps > 0 || s.kg > 0)
    if (parsed.length === 0) return
    logSession.mutate(
      { exerciseId: ex.id, sets: parsed },
      { onSuccess: () => setSets([{ reps: '', kg: '' }]) },
    )
  }

  return (
    <div className="rounded-xl border border-border-c p-3">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="font-bold text-text">{ex.name}</div>
          {ex.goal_weight && (
            <div className="text-xs text-muted">
              Goal: {ex.goal_weight}kg × {ex.goal_reps ?? '?'} × {ex.goal_sets ?? '?'}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs text-muted">{i + 1}</span>
            <Input
              type="number"
              placeholder="reps"
              value={s.reps}
              onChange={(e) => updateSet(i, 'reps', e.target.value)}
            />
            <Input
              type="number"
              placeholder="kg"
              value={s.kg}
              onChange={(e) => updateSet(i, 'kg', e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSets((p) => [...p, { reps: '', kg: '' }])}
        >
          + Set
        </Button>
        <Button size="sm" onClick={save} disabled={logSession.isPending}>
          Log session
        </Button>
      </div>

      {chartData.length > 1 && (
        <div className="mt-3 border-t border-dashed border-border-c pt-2">
          <TrendLine data={chartData} xKey="date" yKey="kg" height={150} unit="kg" />
        </div>
      )}
    </div>
  )
}

export function WeightsPage() {
  const exercises = useWeightExercises()
  const add = useAddWeightExercise()
  const del = useDeleteWeightExercise()

  const [name, setName] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [goalReps, setGoalReps] = useState('')
  const [goalSets, setGoalSets] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    add.mutate(
      {
        name: name.trim(),
        goal_weight: goalWeight ? +goalWeight : null,
        goal_reps: goalReps ? +goalReps : null,
        goal_sets: goalSets ? +goalSets : null,
      },
      {
        onSuccess: () => {
          setName('')
          setGoalWeight('')
          setGoalReps('')
          setGoalSets('')
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Weights" subtitle="Log sets & track progression" />

      {exercises.isLoading ? (
        <EmptyState>Loading…</EmptyState>
      ) : (exercises.data ?? []).length === 0 ? (
        <Card>
          <EmptyState>No exercises yet — add one below.</EmptyState>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(exercises.data ?? []).map((ex) => (
            <div key={ex.id} className="relative">
              <button
                onClick={() => del.mutate(ex.id)}
                className="absolute right-2 top-2 z-10 px-1 text-muted hover:text-danger"
                aria-label="Delete exercise"
              >
                ✕
              </button>
              <ExercisePanel ex={ex} />
            </div>
          ))}
        </div>
      )}

      <Card title="Add exercise">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bench press"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Goal kg">
              <Input
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
              />
            </Field>
            <Field label="Goal reps">
              <Input
                type="number"
                value={goalReps}
                onChange={(e) => setGoalReps(e.target.value)}
              />
            </Field>
            <Field label="Goal sets">
              <Input
                type="number"
                value={goalSets}
                onChange={(e) => setGoalSets(e.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" disabled={add.isPending}>
            Add exercise
          </Button>
        </form>
      </Card>
    </div>
  )
}
