'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError('Full name is required')
      setIsLoading(false)
      return
    }

    if (!phone.trim()) {
      setError('Phone number is required')
      setIsLoading(false)
      return
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit Indian phone number')
      setIsLoading(false)
      return
    }

    if (whatsapp.trim() && !phoneRegex.test(whatsapp.replace(/\D/g, ''))) {
      setError('Enter a valid WhatsApp number')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || phone.trim(),
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/shop')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
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
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Create account</h2>
          <p className="text-sm text-muted-foreground mb-10">Join the culture</p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <input
                id="full-name"
                type="text"
                placeholder="Full Name *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="email"
                type="email"
                placeholder="Email *"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="phone"
                type="tel"
                placeholder="Phone Number *"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="whatsapp"
                type="tel"
                placeholder="WhatsApp Number (optional)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                placeholder="Password *"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <input
                id="repeat-password"
                type="password"
                placeholder="Confirm password *"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
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
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
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
