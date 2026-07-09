import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toDateKey } from '@/lib/utils'
import type { WeightExercise, WeightLog } from '@/lib/types'

export function useWeightExercises() {
  return useQuery({
    queryKey: ['weight_exercises'],
    queryFn: async (): Promise<WeightExercise[]> => {
      const { data, error } = await supabase
        .from('weight_exercises')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data as WeightExercise[]
    },
  })
}

export function useWeightLogs(exerciseId: string | null) {
  return useQuery({
    queryKey: ['weight_logs', exerciseId],
    enabled: !!exerciseId,
    queryFn: async (): Promise<WeightLog[]> => {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*, weight_sets(*)')
        .eq('exercise_id', exerciseId!)
        .order('date')
      if (error) throw error
      return data as WeightLog[]
    },
  })
}

export function useAddWeightExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ex: {
      name: string
      goal_weight: number | null
      goal_reps: number | null
      goal_sets: number | null
    }) => {
      const { error } = await supabase.from('weight_exercises').insert(ex)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight_exercises'] }),
  })
}

export function useDeleteWeightExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weight_exercises')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight_exercises'] }),
  })
}

export function useLogWeightSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      exerciseId,
      sets,
    }: {
      exerciseId: string
      sets: { reps: number; kg: number }[]
    }) => {
      const { data: log, error } = await supabase
        .from('weight_logs')
        .insert({ exercise_id: exerciseId, date: toDateKey() })
        .select('id')
        .single()
      if (error) throw error
      const rows = sets.map((s, i) => ({
        log_id: log.id,
        set_no: i + 1,
        reps: s.reps,
        kg: s.kg,
      }))
      const { error: e2 } = await supabase.from('weight_sets').insert(rows)
      if (e2) throw e2
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['weight_logs', vars.exerciseId] }),
  })
}
