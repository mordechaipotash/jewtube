'use client'

import { useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerStore } from '@/lib/store'
import { formatDuration, formatRelativeDate, getMetadata, type Video } from '@/lib/api'

interface ResultsListProps {
  videos: Video[]
  isLoading: boolean
  sortBy: string
}

export function ResultsList({ videos, isLoading, sortBy }: ResultsListProps) {
  const { currentVideo, isPlaying, setCurrentVideo, setIsPlaying } = usePlayerStore()
  const [metadata, setMetadata] = useState<Record<string, Partial<Video>>>({})

  useEffect(() => {
    videos.forEach((video) => {
      if (!metadata[video.id] && !video.upload_date) {
        getMetadata(video.id)
          .then((data) => setMetadata((prev) => ({ ...prev, [video.id]: data })))
          .catch(() => {})
      }
    })
  }, [videos, metadata])

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'date') {
      const aDate = metadata[a.id]?.upload_timestamp || a.upload_timestamp || 0
      const bDate = metadata[b.id]?.upload_timestamp || b.upload_timestamp || 0
      return bDate - aDate
    }
    if (sortBy === 'views') {
      const aViews = metadata[a.id]?.view_count || a.view_count || 0
      const bViews = metadata[b.id]?.view_count || b.view_count || 0
      return bViews - aViews
    }
    return 0
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
            <Skeleton className="size-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!videos.length) return null

  return (
    <div className="space-y-1">
      {sortedVideos.map((video) => {
        const meta = metadata[video.id] || {}
        const isCurrent = currentVideo?.id === video.id
        const uploadDate = meta.upload_date || video.upload_date
        const views = meta.views || video.views

        return (
          <button
            key={video.id}
            onClick={() => {
              if (isCurrent) {
                setIsPlaying(!isPlaying)
              } else {
                setCurrentVideo(video)
                setIsPlaying(true)
              }
            }}
            className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors hover:bg-accent ${
              isCurrent ? 'bg-accent' : ''
            }`}
          >
            <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0">
              {isCurrent && isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 ml-0.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{video.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {video.channel}
                {views && ` · ${views}`}
                {uploadDate && ` · ${formatRelativeDate(uploadDate)}`}
              </p>
            </div>
            <span className="text-sm text-muted-foreground shrink-0">
              {formatDuration(video.duration)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
