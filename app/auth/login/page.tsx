'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      await new Promise(r => setTimeout(r, 500))
      const redirect = searchParams.get('redirect') || '/shop'
      router.push(redirect)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
    >
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Welcome back</h2>
      <p className="text-sm text-muted-foreground mb-10">Sign in to continue</p>

      <form onSubmit={handleLogin} className="space-y-5">
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
          <div>
            <input
              id="password"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-[11px] text-muted-foreground hover:text-foreground/50 transition-colors">
              Forgot password?
            </Link>
          </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400/80"
          >
            {error}
          </motion.p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all disabled:opacity-40 mt-4"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-foreground/40 hover:text-foreground/70 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
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

        <Suspense fallback={
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border border-border border-t-foreground rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
