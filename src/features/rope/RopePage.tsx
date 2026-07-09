import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useAddSportSession,
  useDeleteSportSession,
  useSportSessions,
} from '@/data/sport'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  StatTile,
  Textarea,
} from '@/components/ui'
import { fmtDate, fmtDuration } from '@/lib/utils'

export function RopePage() {
  const sessions = useSportSessions('rope_jump')
  const add = useAddSportSession()
  const del = useDeleteSportSession()

  const [minutes, setMinutes] = useState('')
  const [jumps, setJumps] = useState('')
  const [rounds, setRounds] = useState('')
  const [notes, setNotes] = useState('')

  const data = sessions.data ?? []
  const totalJumps = data.reduce((n, s) => n + (Number(s.metrics.jumps) || 0), 0)
  const totalMin = Math.round(
    data.reduce((n, s) => n + s.duration_sec, 0) / 60,
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    add.mutate(
      {
        type: 'rope_jump',
        duration_sec: Math.round((+minutes || 0) * 60),
        metrics: { jumps: +jumps || 0, rounds: +rounds || 0 },
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setMinutes('')
          setJumps('')
          setRounds('')
          setNotes('')
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="🪢 Rope Jumping" subtitle="Log skipping sessions" />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Sessions" value={data.length} accent="primary" />
        <StatTile label="Total jumps" value={totalJumps} accent="success" />
        <StatTile label="Total min" value={totalMin} accent="warning" />
      </div>

      <Card
        title="Log a session"
        action={
          <Link to="/timer">
            <Button variant="ghost" size="sm">
              Use interval timer →
            </Button>
          </Link>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Minutes">
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </Field>
            <Field label="Jumps">
              <Input
                type="number"
                value={jumps}
                onChange={(e) => setJumps(e.target.value)}
              />
            </Field>
            <Field label="Rounds">
              <Input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel?"
            />
          </Field>
          <Button type="submit" disabled={add.isPending}>
            Save session
          </Button>
        </form>
      </Card>

      <Card title="History">
        {data.length === 0 ? (
          <EmptyState>No sessions logged yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {data.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border-c bg-surface-2 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-text">
                    {s.metrics.jumps || 0} jumps · {fmtDuration(s.duration_sec)}
                  </div>
                  <div className="text-xs text-muted">
                    {fmtDate(s.date)}
                    {s.notes ? ` · ${s.notes}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => del.mutate(s.id)}
                  className="px-1.5 text-muted hover:text-danger"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
