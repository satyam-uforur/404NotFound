'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
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
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Reset password</h2>
          <p className="text-sm text-muted-foreground mb-10">
            {sent ? 'Check your email for a reset link.' : 'Enter your email and we\'ll send you a reset link.'}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 border border-foreground/20 flex items-center justify-center text-foreground/40">
                ✓
              </div>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </motion.div>
          )}

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-foreground/40 hover:text-foreground/70 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
