import { useState } from 'react'
import {
  useAddChecklistItem,
  useChecklistItems,
  useChecklistLogs,
  useDeleteChecklistItem,
  useToggleChecklist,
} from '@/data/checklist'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
} from '@/components/ui'
import {
  classNames,
  computeStreak,
  doneDatesForItem,
  lastNDays,
  toDateKey,
} from '@/lib/utils'

const CATEGORY_ICON: Record<string, string> = {
  cardio: '🏃',
  weight: '🏋️',
  other: '✅',
}

export function ChecklistPage() {
  const items = useChecklistItems()
  const logs = useChecklistLogs()
  const toggle = useToggleChecklist()
  const addItem = useAddChecklistItem()
  const del = useDeleteChecklistItem()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('cardio')

  const today = toDateKey()
  const week = lastNDays(7)
  const allLogs = logs.data ?? []

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addItem.mutate(
      { name: name.trim(), category, icon: CATEGORY_ICON[category] },
      { onSuccess: () => setName('') },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Checklist" subtitle="Daily habits & streaks" />

      <Card title="Today">
        {items.isLoading ? (
          <EmptyState>Loading…</EmptyState>
        ) : (items.data ?? []).length === 0 ? (
          <EmptyState>No habits yet — add one below.</EmptyState>
        ) : (
          <ul>
            {(items.data ?? []).map((item) => {
              const done = doneDatesForItem(allLogs, item.id)
              const isDone = done.has(today)
              const streak = computeStreak(done)
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 border-b border-border-c py-2.5 last:border-none"
                >
                  <button
                    onClick={() =>
                      toggle.mutate({
                        itemId: item.id,
                        date: today,
                        done: !isDone,
                      })
                    }
                    className={classNames(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm transition',
                      isDone
                        ? 'border-success bg-success text-white'
                        : 'border-border-c bg-surface-2',
                    )}
                    aria-label={isDone ? 'Mark not done' : 'Mark done'}
                  >
                    {isDone ? '✓' : ''}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-text">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
                      {week.map((d) => (
                        <span
                          key={d}
                          title={d}
                          className={classNames(
                            'h-2.5 w-2.5 rounded-[3px]',
                            done.has(d) ? 'bg-success' : 'bg-border-c',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {streak > 0 && (
                    <span className="whitespace-nowrap rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-bold text-warning">
                      🔥 {streak}d
                    </span>
                  )}
                  <button
                    onClick={() => del.mutate(item.id)}
                    className="px-1.5 text-muted hover:text-danger"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card title="Add habit">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rope skipping"
              />
            </Field>
          </div>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="cardio">Cardio</option>
              <option value="weight">Weights</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Button type="submit" disabled={addItem.isPending}>
            Add
          </Button>
        </form>
      </Card>
    </div>
  )
}
