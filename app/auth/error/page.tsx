'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-serif font-bold text-foreground/60 mb-4">Authentication Error</h1>
        <p className="text-muted-foreground text-sm mb-10">Something went wrong during authentication.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login" className="px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all">
            Try Again
          </Link>
          <Link href="/" className="px-8 py-4 border border-border text-foreground/30 text-sm hover:text-foreground/60 transition-all">
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
