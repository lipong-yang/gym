import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TimerPreset } from '@/lib/types'

export function useTimerPresets() {
  return useQuery({
    queryKey: ['timer_presets'],
    queryFn: async (): Promise<TimerPreset[]> => {
      const { data, error } = await supabase
        .from('timer_presets')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data as TimerPreset[]
    },
  })
}

export function useSaveTimerPreset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Omit<TimerPreset, 'id'>) => {
      const { error } = await supabase.from('timer_presets').insert(p)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timer_presets'] }),
  })
}

export function useDeleteTimerPreset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timer_presets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timer_presets'] }),
  })
}
