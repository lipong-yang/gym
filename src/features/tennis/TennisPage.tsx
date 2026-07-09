import { useState } from 'react'
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

export function TennisPage() {
  const sessions = useSportSessions('tennis')
  const add = useAddSportSession()
  const del = useDeleteSportSession()

  const [minutes, setMinutes] = useState('')
  const [opponent, setOpponent] = useState('')
  const [won, setWon] = useState('')
  const [lost, setLost] = useState('')
  const [notes, setNotes] = useState('')

  const data = sessions.data ?? []
  const matches = data.length
  const setsWon = data.reduce((n, s) => n + (Number(s.metrics.sets_won) || 0), 0)
  const setsLost = data.reduce((n, s) => n + (Number(s.metrics.sets_lost) || 0), 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    add.mutate(
      {
        type: 'tennis',
        duration_sec: Math.round((+minutes || 0) * 60),
        metrics: {
          opponent: opponent.trim(),
          sets_won: +won || 0,
          sets_lost: +lost || 0,
        },
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setMinutes('')
          setOpponent('')
          setWon('')
          setLost('')
          setNotes('')
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="🎾 Tennis" subtitle="Log matches & practice" />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Matches" value={matches} accent="primary" />
        <StatTile label="Sets won" value={setsWon} accent="success" />
        <StatTile label="Sets lost" value={setsLost} accent="danger" />
      </div>

      <Card title="Log a match">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Opponent">
              <Input
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="Name"
              />
            </Field>
            <Field label="Minutes">
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </Field>
            <Field label="Sets won">
              <Input
                type="number"
                value={won}
                onChange={(e) => setWon(e.target.value)}
              />
            </Field>
            <Field label="Sets lost">
              <Input
                type="number"
                value={lost}
                onChange={(e) => setLost(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={add.isPending}>
            Save match
          </Button>
        </form>
      </Card>

      <Card title="History">
        {data.length === 0 ? (
          <EmptyState>No matches logged yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {data.map((s) => {
              const w = Number(s.metrics.sets_won) || 0
              const l = Number(s.metrics.sets_lost) || 0
              const win = w > l
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border-c bg-surface-2 px-3 py-2"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text">
                      <span
                        className={
                          win ? 'text-success' : l > w ? 'text-danger' : 'text-muted'
                        }
                      >
                        {w}–{l}
                      </span>
                      {s.metrics.opponent ? `vs ${s.metrics.opponent}` : 'Practice'}
                    </div>
                    <div className="text-xs text-muted">
                      {fmtDate(s.date)} · {fmtDuration(s.duration_sec)}
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
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
