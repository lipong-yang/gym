import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toDateKey } from '@/lib/utils'
import type { ChecklistItem, ChecklistLog } from '@/lib/types'

export function useChecklistItems() {
  return useQuery({
    queryKey: ['checklist_items'],
    queryFn: async (): Promise<ChecklistItem[]> => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('archived', false)
        .order('created_at')
      if (error) throw error
      return data as ChecklistItem[]
    },
  })
}

export function useChecklistLogs() {
  return useQuery({
    queryKey: ['checklist_logs'],
    queryFn: async (): Promise<ChecklistLog[]> => {
      const since = new Date()
      since.setDate(since.getDate() - 60)
      const { data, error } = await supabase
        .from('checklist_logs')
        .select('*')
        .gte('date', toDateKey(since))
      if (error) throw error
      return data as ChecklistLog[]
    },
  })
}

export function useAddChecklistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (item: {
      name: string
      category: string
      icon: string
    }) => {
      const { error } = await supabase.from('checklist_items').insert(item)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist_items'] }),
  })
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_items')
        .update({ archived: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist_items'] }),
  })
}

export function useToggleChecklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      date,
      done,
    }: {
      itemId: string
      date: string
      done: boolean
    }) => {
      const { error } = await supabase
        .from('checklist_logs')
        .upsert(
          { item_id: itemId, date, done },
          { onConflict: 'item_id,date' },
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist_logs'] }),
  })
}
