'use client'

import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[8rem] font-serif font-bold text-foreground/[0.03] leading-none mb-[-1rem]">
          ERR
        </div>
        <p className="text-muted-foreground text-sm font-mono tracking-[0.2em] uppercase mb-2">
          Something went wrong
        </p>
        <p className="text-foreground/10 text-xs mb-10">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  )
}
