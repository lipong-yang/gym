// Row shapes mirroring supabase/schema.sql.

export type ChecklistCategory = 'cardio' | 'weight' | 'other'

export interface ChecklistItem {
  id: string
  name: string
  category: ChecklistCategory
  icon: string
  archived: boolean
  created_at: string
}

export interface ChecklistLog {
  id: string
  item_id: string
  date: string // YYYY-MM-DD
  done: boolean
}

export interface TimerPreset {
  id: string
  name: string
  work_sec: number
  rest_sec: number
  rounds: number
  warmup_sec: number
}

export interface WeightExercise {
  id: string
  name: string
  goal_weight: number | null
  goal_reps: number | null
  goal_sets: number | null
  created_at: string
}

export interface WeightSet {
  id: string
  log_id: string
  set_no: number
  reps: number
  kg: number
}

export interface WeightLog {
  id: string
  exercise_id: string
  date: string
  created_at: string
  weight_sets?: WeightSet[]
}

export interface Goal {
  id: string
  name: string
  type: 'custom' | 'consistency' | 'strength'
  target: number
  unit: string
}

export interface RunPoint {
  lat: number
  lng: number
  alt?: number | null
  ts?: number
}

export interface RunSplit {
  km: number
  sec: number
}

export interface Run {
  id: string
  name: string
  notes: string
  date: string
  distance_m: number
  duration_sec: number
  elev_gain_m: number
  calories_kcal: number
  splits: RunSplit[]
  points: RunPoint[]
  source: 'live' | 'gpx-import'
  created_at: string
}

export interface RunPhoto {
  id: string
  run_id: string
  storage_path: string
}

export type SportType = 'rope_jump' | 'tennis' | 'other'

export interface SportSession {
  id: string
  type: SportType
  date: string
  duration_sec: number
  metrics: Record<string, number | string>
  notes: string
}
