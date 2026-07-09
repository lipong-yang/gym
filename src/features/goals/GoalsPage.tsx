import { useMemo, useState } from 'react'
import { useAddGoal, useDeleteGoal, useGoals } from '@/data/goals'
import { useChecklistLogs } from '@/data/checklist'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
} from '@/components/ui'
import { lastNDays } from '@/lib/utils'

function Progress({
  name,
  value,
  target,
  unit,
  onDelete,
}: {
  name: string
  value: number
  target: number
  unit: string
  onDelete?: () => void
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div className="rounded-xl border border-border-c p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-text">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {value}
            {unit} / {target}
            {unit}
          </span>
          {onDelete && (
            <button onClick={onDelete} className="text-muted hover:text-danger">
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-border-c">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function GoalsPage() {
  const goals = useGoals()
  const add = useAddGoal()
  const del = useDeleteGoal()
  const logs = useChecklistLogs()

  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')

  // Weekly consistency: distinct active days over the last 7 days (target 5).
  const weeklyDays = useMemo(() => {
    const week = new Set(lastNDays(7))
    const active = new Set(
      (logs.data ?? [])
        .filter((l) => l.done && week.has(l.date))
        .map((l) => l.date),
    )
    return active.size
  }, [logs.data])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !target) return
    add.mutate(
      { name: name.trim(), target: +target, unit: unit.trim(), type: 'custom' },
      {
        onSuccess: () => {
          setName('')
          setTarget('')
          setUnit('')
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Goals" subtitle="Targets & weekly consistency" />

      <Card title="This week">
        <Progress
          name="Workout days"
          value={weeklyDays}
          target={5}
          unit=""
        />
      </Card>

      <Card title="Custom goals">
        {goals.isLoading ? (
          <EmptyState>Loading…</EmptyState>
        ) : (goals.data ?? []).length === 0 ? (
          <EmptyState>No custom goals yet.</EmptyState>
        ) : (
          <div className="space-y-2">
            {(goals.data ?? []).map((g) => (
              <Progress
                key={g.id}
                name={g.name}
                value={0}
                target={g.target}
                unit={g.unit}
                onDelete={() => del.mutate(g.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Add goal">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Run 20 km this week"
              />
            </Field>
          </div>
          <Field label="Target">
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
          <Field label="Unit">
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="km"
              className="w-20"
            />
          </Field>
          <Button type="submit" disabled={add.isPending}>
            Add
          </Button>
        </form>
      </Card>
    </div>
  )
}
