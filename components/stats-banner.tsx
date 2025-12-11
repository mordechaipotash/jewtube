'use client'

import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getStats } from '@/lib/api'

export function StatsBanner() {
  const [stats, setStats] = useState<{
    user_count: number
    free_slots: number
  } | null>(null)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats({ user_count: 0, free_slots: 20 }))
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: 'Jewtube',
      text: 'Listen to YouTube as audio only - perfect for shiurim and learning!',
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.origin)
      .then(() => alert('Link copied!'))
      .catch(() => prompt('Copy this link:', window.location.origin))
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center text-sm">
      {stats ? (
        <>
          <strong>{stats.user_count}</strong> users joined
          {stats.free_slots > 0 && (
            <>
              {' · '}
              <strong>{stats.free_slots}</strong> free spots left
            </>
          )}
          {' · $5/month after free tier'}
        </>
      ) : (
        <Skeleton className="h-4 w-48 mx-auto bg-white/20" />
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="ml-3 h-6 px-2 bg-white/20 hover:bg-white/30 text-white text-xs"
      >
        <Share2 className="size-3 mr-1" />
        Share
      </Button>
    </div>
  )
}
