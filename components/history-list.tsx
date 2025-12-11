'use client'

import { useEffect, useState } from 'react'
import { History, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerStore } from '@/lib/store'
import { getHistory, clearHistory, type HistoryItem } from '@/lib/database'
import { formatDuration, formatRelativeDate } from '@/lib/api'
import { createClient } from '@/lib/supabase'

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo)
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true)
        loadHistory()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        loadHistory()
      } else {
        setIsLoggedIn(false)
        setHistory([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const items = await getHistory(30)
    setHistory(items)
    setLoading(false)
  }

  const handlePlay = (item: HistoryItem) => {
    setCurrentVideo({
      id: item.video_id,
      title: item.title,
      channel: item.channel,
      duration: item.duration,
      duration_raw: item.duration || 0,
      upload_date: '',
      upload_timestamp: 0,
      views: '',
      view_count: 0,
      url: `https://youtube.com/watch?v=${item.video_id}`
    })
    setIsPlaying(true)
  }

  const handleClearHistory = async () => {
    await clearHistory()
    setHistory([])
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <History className="size-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Sign in to see your history</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="size-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="size-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No listening history yet</p>
        <p className="text-sm text-muted-foreground/75 mt-1">Play something to see it here</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="size-5" />
          Recent History
        </h2>
        <Button variant="ghost" size="sm" onClick={handleClearHistory}>
          <Trash2 className="size-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePlay(item)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left group"
          >
            <div className="size-10 bg-muted rounded flex items-center justify-center group-hover:bg-primary/10">
              <Play className="size-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.channel} · {formatDuration(item.duration)} · {formatRelativeDate(item.viewed_at)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
