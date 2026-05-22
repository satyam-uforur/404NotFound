'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

function WorldTransition({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, times: [0, 0.4, 0.6, 1], ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAuth = pathname.startsWith('/auth')
  const isHome = pathname === '/'
  const [transitioning, setTransitioning] = useState(false)
  const prevPath = useRef(pathname)

  useEffect(() => {
    const wasHome = prevPath.current === '/'
    const nowHome = pathname === '/'
    if (wasHome !== nowHome) {
      setTransitioning(true)
      const timer = setTimeout(() => setTransitioning(false), 900)
      return () => clearTimeout(timer)
    }
    prevPath.current = pathname
  }, [pathname])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isHome) {
        document.documentElement.classList.remove('world-white')
      } else if (!isAdmin) {
        document.documentElement.classList.add('world-white')
      }
    }
  }, [isHome, isAdmin])

  if (isAdmin) {
    return <>{children}</>
  }

  if (isAuth) {
    return (
      <div className={isHome ? '' : 'world-white'}>
        <Navbar variant="minimal" isDarkWorld={false} />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={isHome ? '' : 'world-white'}>
      <WorldTransition active={transitioning} />
      <Navbar isDarkWorld={isHome} />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <main>{children}</main>
        </motion.div>
      </AnimatePresence>
      {!isHome && <Footer />}
    </div>
  )
}
