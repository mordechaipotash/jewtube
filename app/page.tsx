'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search-bar'
import { ResultsList } from '@/components/results-list'
import { Player } from '@/components/player'
import { StatsBanner } from '@/components/stats-banner'
import { AboutDialog } from '@/components/about-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthButton } from '@/components/auth-button'
import { searchVideos, type Video } from '@/lib/api'

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string, dateFilter: string, sort: string) => {
    setIsLoading(true)
    setSortBy(sort)
    setHasSearched(true)
    try {
      const results = await searchVideos(query, dateFilter === 'any' ? '' : dateFilter)
      setVideos(results)
    } catch (error) {
      console.error('Search failed:', error)
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StatsBanner />

      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Jewtube</h1>
            <div className="flex items-center gap-1">
              <AboutDialog />
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-32">
        {!hasSearched ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Search for audio content</p>
          </div>
        ) : videos.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No results found</p>
          </div>
        ) : (
          <ResultsList videos={videos} isLoading={isLoading} sortBy={sortBy} />
        )}
      </main>

      <Player />
    </div>
  )
}
