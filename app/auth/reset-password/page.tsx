'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/shop')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">404</h1>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.3em] mt-0.5">NotFoundIN</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">New password</h2>
          <p className="text-sm text-muted-foreground mb-10">Choose a new password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                id="password"
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400/80">
                {error}
              </motion.p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all disabled:opacity-40 mt-4"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
