'use client'

import { motion } from 'framer-motion'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-black/10 text-6xl font-serif font-bold mb-4">ERR</p>
        <p className="text-black/20 text-sm mb-8">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="text-black/30 text-sm hover:text-black/60 transition-colors border border-black/10 px-6 py-3"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  )
}
