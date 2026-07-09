import { useMemo, useRef } from 'react'
import { RunMap } from './RunMap'
import { useRunPhotos, useUploadRunPhoto } from '@/data/running'
import { AreaTrend } from '@/components/Charts'
import { Button, Card, StatTile } from '@/components/ui'
import {
  fmtDate,
  fmtDistance,
  fmtDuration,
  fmtPace,
  pathDistance,
} from '@/lib/utils'
import type { Run } from '@/lib/types'

export function RunDetail({ run, onBack }: { run: Run; onBack: () => void }) {
  const photos = useRunPhotos(run.id)
  const upload = useUploadRunPhoto()
  const fileRef = useRef<HTMLInputElement>(null)

  const eleData = useMemo(() => {
    let dist = 0
    const out: { d: string; ele: number }[] = []
    const pts = run.points
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) dist += pathDistance([pts[i - 1], pts[i]])
      if (pts[i].alt != null && i % 3 === 0)
        out.push({ d: (dist / 1000).toFixed(1), ele: Math.round(pts[i].alt!) })
    }
    return out
  }, [run.points])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload.mutate({ runId: run.id, file })
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div>
          <h1 className="text-lg font-extrabold text-text">{run.name}</h1>
          <p className="text-xs text-muted">{fmtDate(run.date)}</p>
        </div>
      </div>

      {run.points.length > 1 && (
        <Card className="!p-2">
          <RunMap points={run.points} height={280} />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Distance" value={fmtDistance(run.distance_m)} accent="primary" />
        <StatTile label="Time" value={fmtDuration(run.duration_sec)} />
        <StatTile label="Pace" value={fmtPace(run.distance_m, run.duration_sec)} accent="success" />
        <StatTile label="Elev gain" value={`${Math.round(run.elev_gain_m)}m`} accent="warning" />
      </div>

      {run.splits.length > 0 && (
        <Card title="Splits">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-1 pr-4 font-semibold">KM</th>
                  <th className="pb-1 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {run.splits.map((s) => (
                  <tr key={s.km} className="border-t border-border-c">
                    <td className="py-1 pr-4 tabular-nums">{s.km}</td>
                    <td className="py-1 tabular-nums">{fmtDuration(s.sec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {eleData.length > 1 && (
        <Card title="Elevation">
          <AreaTrend data={eleData} xKey="d" yKey="ele" unit="m" />
        </Card>
      )}

      <Card
        title="Photos"
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
            >
              + Add
            </Button>
          </>
        }
      >
        {upload.isError && (
          <p className="mb-2 text-xs text-danger">
            {(upload.error as Error).message}
          </p>
        )}
        {(photos.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(photos.data ?? []).map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt="Run"
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
