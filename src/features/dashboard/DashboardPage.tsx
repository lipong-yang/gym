import { useMemo } from 'react'
import { useRuns } from '@/data/running'
import { useSportSessions } from '@/data/sport'
import { useChecklistLogs } from '@/data/checklist'
import { AreaTrend, BarTrend } from '@/components/Charts'
import { Card, EmptyState, PageHeader, StatTile } from '@/components/ui'
import { fmtDate, lastNDays, toDateKey } from '@/lib/utils'

export function DashboardPage() {
  const runs = useRuns()
  const sports = useSportSessions()
  const logs = useChecklistLogs()

  const runData = runs.data ?? []
  const sportData = sports.data ?? []

  const totalKm = useMemo(
    () => runData.reduce((n, r) => n + r.distance_m, 0) / 1000,
    [runData],
  )
  const ropeCount = sportData.filter((s) => s.type === 'rope_jump').length
  const tennisCount = sportData.filter((s) => s.type === 'tennis').length

  // Sessions per day over the last 7 days (runs + sports + checklist days).
  const weekActivity = useMemo(() => {
    const days = lastNDays(7)
    const counts = new Map(days.map((d) => [d, 0]))
    for (const r of runData) {
      const k = toDateKey(new Date(r.date))
      if (counts.has(k)) counts.set(k, counts.get(k)! + 1)
    }
    for (const s of sportData) {
      const k = toDateKey(new Date(s.date))
      if (counts.has(k)) counts.set(k, counts.get(k)! + 1)
    }
    return days.map((d) => ({
      day: new Date(d).toLocaleDateString(undefined, { weekday: 'short' }),
      sessions: counts.get(d) ?? 0,
    }))
  }, [runData, sportData])

  const runTrend = useMemo(
    () =>
      [...runData]
        .reverse()
        .slice(-12)
        .map((r) => ({
          date: fmtDate(r.date).replace(/,.*/, ''),
          km: +(r.distance_m / 1000).toFixed(2),
        })),
    [runData],
  )

  const activeToday = (logs.data ?? []).some(
    (l) => l.done && l.date === toDateKey(),
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="Your training at a glance" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total runs" value={runData.length} accent="primary" />
        <StatTile label="Total km" value={totalKm.toFixed(1)} accent="success" />
        <StatTile label="Rope sessions" value={ropeCount} accent="warning" />
        <StatTile label="Tennis matches" value={tennisCount} accent="danger" />
      </div>

      <Card title="This week's activity">
        <BarTrend data={weekActivity} xKey="day" yKey="sessions" height={170} />
        <p className="mt-1 text-center text-xs text-muted">
          {activeToday ? '✅ You logged a habit today' : 'No habit checked today yet'}
        </p>
      </Card>

      <Card title="Running distance trend">
        {runTrend.length > 1 ? (
          <AreaTrend data={runTrend} xKey="date" yKey="km" unit=" km" />
        ) : (
          <EmptyState>Track a couple of runs to see your trend.</EmptyState>
        )}
      </Card>
    </div>
  )
}
