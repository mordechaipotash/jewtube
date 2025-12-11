'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/lib/store'
import { getStreamUrl, formatDuration } from '@/lib/api'

const SPEEDS = [1, 1.25, 1.5, 1.75, 2]

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const {
    currentVideo,
    isPlaying,
    progress,
    duration,
    volume,
    speed,
    setIsPlaying,
    setProgress,
    setDuration,
    setVolume,
    setSpeed,
  } = usePlayerStore()

  const loadAudio = useCallback(async () => {
    if (!currentVideo || !audioRef.current) return
    try {
      const url = await getStreamUrl(currentVideo.id)
      audioRef.current.src = url
      audioRef.current.playbackRate = speed
      audioRef.current.volume = volume
      audioRef.current.play()
    } catch (error) {
      console.error('Failed to load audio:', error)
      setIsPlaying(false)
    }
  }, [currentVideo, speed, volume, setIsPlaying])

  useEffect(() => {
    loadAudio()
  }, [currentVideo?.id, loadAudio])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, setIsPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setProgress(value[0])
    }
  }

  const cycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(speed)
    const nextIndex = (currentIndex + 1) % SPEEDS.length
    setSpeed(SPEEDS[nextIndex])
  }

  if (!currentVideo) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-0.5" />}
          </Button>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{currentVideo.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground w-10">
                {formatDuration(Math.floor(progress))}
              </span>
              <Slider
                value={[progress]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatDuration(Math.floor(duration))}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={cycleSpeed}
            className="text-xs w-12"
          >
            {speed}x
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
            >
              {volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={(v) => setVolume(v[0])}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
