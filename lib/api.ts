const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ytaudio-production.up.railway.app'

export interface Video {
  id: string
  title: string
  channel: string
  duration: number | null
  duration_raw: number
  upload_date: string
  upload_timestamp: number
  views: string
  view_count: number
  url: string
}

export interface SearchResult {
  videos: Video[]
}

export async function searchVideos(
  query: string,
  dateFilter?: string
): Promise<Video[]> {
  const params = new URLSearchParams({ q: query })
  if (dateFilter) params.append('date', dateFilter)

  const res = await fetch(`${API_URL}/api/search?${params}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function getStreamUrl(videoId: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/stream/${videoId}`)
  if (!res.ok) throw new Error('Failed to get stream')
  const data = await res.json()
  return data.url
}

export async function getMetadata(videoId: string): Promise<Partial<Video>> {
  const res = await fetch(`${API_URL}/api/metadata/${videoId}`)
  if (!res.ok) throw new Error('Failed to get metadata')
  return res.json()
}

export async function getStats(): Promise<{
  user_count: number
  free_slots: number
  pricing: { free_tier: number; paid_tier: number; price: string }
}> {
  const res = await fetch(`${API_URL}/api/stats`)
  if (!res.ok) throw new Error('Failed to get stats')
  return res.json()
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h) return `${h}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${mins}:${s.toString().padStart(2, '0')}`
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return ''
  const now = new Date()
  const isDateOnly = dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)

  if (isDateOnly) {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const days = Math.floor((today.getTime() - date.getTime()) / 86400000)

    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}
