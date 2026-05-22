'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-black/10 text-6xl font-serif font-bold mb-4">404</p>
        <p className="text-black/20 text-sm mb-8">Page not found</p>
        <Link href="/admin" className="text-black/30 text-sm hover:text-black/60 transition-colors">
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
