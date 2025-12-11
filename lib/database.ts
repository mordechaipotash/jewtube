import { createClient } from './supabase'
import type { Video } from './api'

export interface HistoryItem {
  id: string
  video_id: string
  title: string
  channel: string
  duration: number | null
  viewed_at: string
}

export async function addToHistory(video: Video): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('jewtube_view_history')
    .upsert({
      user_id: user.id,
      video_id: video.id,
      title: video.title,
      channel: video.channel,
      duration: video.duration_raw || video.duration || 0,
      viewed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,video_id'
    })
}

export async function getHistory(limit = 50): Promise<HistoryItem[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('jewtube_view_history')
    .select('*')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch history:', error)
    return []
  }

  return data || []
}

export async function clearHistory(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('jewtube_view_history')
    .delete()
    .eq('user_id', user.id)
}
