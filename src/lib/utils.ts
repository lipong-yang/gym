import type { ChecklistLog, RunPoint } from './types'

/** Local YYYY-MM-DD (not UTC) for a given date. */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Last `n` day keys ending today, oldest first. */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(toDateKey(addDays(new Date(), -i)))
  return out
}

/** Consecutive-day streak ending today for a set of completed date keys. */
export function computeStreak(doneDates: Set<string>): number {
  let streak = 0
  let cursor = new Date()
  // Allow the streak to "hold" if today isn't done yet but yesterday was.
  if (!doneDates.has(toDateKey(cursor))) cursor = addDays(cursor, -1)
  while (doneDates.has(toDateKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function doneDatesForItem(
  logs: ChecklistLog[],
  itemId: string,
): Set<string> {
  return new Set(
    logs.filter((l) => l.item_id === itemId && l.done).map((l) => l.date),
  )
}

export function classNames(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

// --- formatting -----------------------------------------------------------

export function fmtDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

export function fmtDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${Math.round(meters)} m`
}

/** min/km pace string from meters + seconds. */
export function fmtPace(meters: number, sec: number): string {
  if (meters < 5 || sec < 1) return '—'
  const paceSecPerKm = sec / (meters / 1000)
  const m = Math.floor(paceSecPerKm / 60)
  const s = Math.round(paceSecPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// --- geo ------------------------------------------------------------------

/** Haversine distance in meters. */
export function haversine(a: RunPoint, b: RunPoint): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function pathDistance(points: RunPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i])
  return total
}

export function elevationGain(points: RunPoint[]): number {
  let gain = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].alt
    const cur = points[i].alt
    if (prev != null && cur != null && cur > prev) gain += cur - prev
  }
  return gain
}

/** Approx calories: ~1.036 kcal per kg per km (matches the legacy app). */
export function estimateCalories(meters: number, weightKg: number): number {
  return (meters / 1000) * weightKg * 1.036
}
