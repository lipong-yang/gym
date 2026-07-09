import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Run, RunPoint, RunSplit } from '@/lib/types'

export function useRuns() {
  return useQuery({
    queryKey: ['runs'],
    queryFn: async (): Promise<Run[]> => {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data as Run[]
    },
  })
}

export interface NewRun {
  name: string
  notes: string
  distance_m: number
  duration_sec: number
  elev_gain_m: number
  calories_kcal: number
  splits: RunSplit[]
  points: RunPoint[]
  source: 'live' | 'gpx-import'
}

export function useSaveRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (run: NewRun): Promise<string> => {
      const { data, error } = await supabase
        .from('runs')
        .insert(run)
        .select('id')
        .single()
      if (error) throw error
      return data.id as string
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['runs'] }),
  })
}

export function useDeleteRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('runs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['runs'] }),
  })
}

// --- photos ---------------------------------------------------------------

export function useRunPhotos(runId: string) {
  return useQuery({
    queryKey: ['run_photos', runId],
    queryFn: async (): Promise<{ id: string; url: string }[]> => {
      const { data, error } = await supabase
        .from('run_photos')
        .select('*')
        .eq('run_id', runId)
      if (error) throw error
      const withUrls = await Promise.all(
        data.map(async (row) => {
          const { data: signed } = await supabase.storage
            .from('run-photos')
            .createSignedUrl(row.storage_path, 3600)
          return { id: row.id, url: signed?.signedUrl ?? '' }
        }),
      )
      return withUrls
    },
  })
}

export function useUploadRunPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ runId, file }: { runId: string; file: File }) => {
      const MAX_BYTES = 10 * 1024 * 1024
      if (!file.type.startsWith('image/'))
        throw new Error('Only image files are allowed.')
      if (file.size > MAX_BYTES)
        throw new Error('Image is too large (max 10 MB).')

      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('You must be signed in to upload photos.')

      const ext = file.type.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg'
      const path = `${uid}/${runId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('run-photos')
        .upload(path, file, { contentType: file.type })
      if (upErr) throw upErr
      const { error } = await supabase
        .from('run_photos')
        .insert({ run_id: runId, storage_path: path })
      if (error) throw error
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['run_photos', vars.runId] }),
  })
}

// --- GPX parsing ----------------------------------------------------------

export function parseGpx(xml: string): RunPoint[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'))
  return trkpts.map((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') ?? '0')
    const lng = parseFloat(pt.getAttribute('lon') ?? '0')
    const eleEl = pt.getElementsByTagName('ele')[0]
    const timeEl = pt.getElementsByTagName('time')[0]
    return {
      lat,
      lng,
      alt: eleEl ? parseFloat(eleEl.textContent ?? '0') : null,
      ts: timeEl ? Date.parse(timeEl.textContent ?? '') : undefined,
    }
  })
}
