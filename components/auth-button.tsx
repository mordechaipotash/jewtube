'use client'

import { useEffect, useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'

export function AuthButton() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [open, setOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUser({ email: data.user.email })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (!error) {
      setSent(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="size-4 mr-1" />
        <span className="hidden sm:inline">{user.email}</span>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <User className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign in to Jewtube</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Check your email for a login link!</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Sign in to save your history across devices
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
