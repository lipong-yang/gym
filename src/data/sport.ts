import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SportSession, SportType } from '@/lib/types'

export function useSportSessions(type?: SportType) {
  return useQuery({
    queryKey: ['sport_sessions', type ?? 'all'],
    queryFn: async (): Promise<SportSession[]> => {
      let q = supabase
        .from('sport_sessions')
        .select('*')
        .order('date', { ascending: false })
      if (type) q = q.eq('type', type)
      const { data, error } = await q
      if (error) throw error
      return data as SportSession[]
    },
  })
}

export function useAddSportSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (s: {
      type: SportType
      duration_sec: number
      metrics: Record<string, number | string>
      notes: string
    }) => {
      const { error } = await supabase.from('sport_sessions').insert(s)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sport_sessions'] }),
  })
}

export function useDeleteSportSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sport_sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sport_sessions'] }),
  })
}
