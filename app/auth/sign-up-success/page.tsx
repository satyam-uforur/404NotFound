'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Mail className="w-10 h-10 mx-auto text-muted-foreground mb-8" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Check your email</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          We sent you a confirmation link. Click it to verify your account and start exploring.
        </p>
        <Link href="/auth/login" className="px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all">
          Go to Login
        </Link>
      </motion.div>
    </div>
  )
}
