'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Info className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">About Jewtube</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Audio-only YouTube player. No videos, no distractions — just the content you want to hear.
          </p>

          <p className="text-sm text-muted-foreground">
            Like many others, I use YouTube for shiurim, learning, and work. I developed Jewtube to help spread kedusha — the audio you need without the visual distractions.
          </p>

          <div className="border-t border-b py-4 my-4 text-center">
            <p className="text-lg mb-1" dir="rtl">לעילוי נשמת</p>
            <p className="text-xl font-bold" dir="rtl">אברהם חיים בן דוד ז״ל</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <span>⚠️</span>
              <span>This service should only be used in accordance with Daas Torah and with appropriate internet filters in place.</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
