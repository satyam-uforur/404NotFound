'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X, ShoppingCart, Search, Heart, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/supabase/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'

interface NavbarProps {
  variant?: 'default' | 'minimal'
  isDarkWorld?: boolean
}

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar({ variant = 'default', isDarkWorld = true }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const cartCount = useCartStore((s) => s.getTotalItems())
  const [isOpen, setIsOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const lastY = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastY.current
    lastY.current = latest
    setScrolled(latest > 60)
    if (latest > previous && latest > 150) setHidden(true)
    else setHidden(false)
  })

  useEffect(() => { setIsOpen(false) }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const d = isDarkWorld
  const textMain = d ? 'text-white' : 'text-foreground'
  const textMuted = d ? 'text-white/40' : 'text-foreground/40'
  const textHover = d ? 'hover:text-white/80' : 'hover:text-foreground/80'
  const textActive = d ? 'text-white' : 'text-foreground'
  const borderSubtle = d ? 'bg-white/20' : 'bg-foreground/20'
  const indicatorBg = d ? 'bg-white' : 'bg-foreground'
  const btnBg = d ? 'bg-white text-black' : 'bg-foreground text-background'
  const btnBgHover = d ? 'hover:bg-white/90' : 'hover:bg-foreground/90'
  const mobileMenuBg = d ? 'bg-black' : 'bg-background'
  const mobileTextMuted = d ? 'text-white/30 hover:text-white/70' : 'text-foreground/30 hover:text-foreground/70'
  const mobileTextActive = d ? 'text-white' : 'text-foreground'
  const mobileIcon = d ? 'text-white/60 hover:text-white' : 'text-foreground/60 hover:text-foreground'
  const cartBadgeBg = d ? 'bg-white text-black' : 'bg-foreground text-background'
  const hoverBg = d ? 'hover:bg-white/5' : 'hover:bg-foreground/5'
  const iconMuted = d ? 'text-white/40' : 'text-foreground/40'
  const iconHover = d ? 'hover:text-white' : 'hover:text-foreground'

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? isDarkWorld
              ? 'glass-strong'
              : 'bg-white/80 backdrop-blur-xl border-b border-black/[0.04]'
            : isDarkWorld
              ? 'bg-transparent'
              : 'bg-transparent'
        }`}
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group relative z-10">
              <span className={`text-xl md:text-2xl font-serif font-bold tracking-tight ${textMain}`}>
                404
              </span>
              <div className={`w-px h-4 md:h-5 ${borderSubtle}`} />
              <span className={`text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-colors duration-300 ${
                d ? 'text-white/50 group-hover:text-white/80' : 'text-foreground/40 group-hover:text-foreground/70'
              }`}>
                NotFoundIN
              </span>
            </Link>

            {variant === 'default' && (
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-300 ${textMuted} ${textHover} ${
                        isActive ? textActive : ''
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className={`absolute bottom-0 left-4 right-4 h-px ${indicatorBg}`}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}

            <div className="hidden md:flex items-center gap-1">
              {variant === 'default' && (
                <Link href="/shop/products" className={`p-2.5 ${iconMuted} ${iconHover} transition-colors duration-300 rounded-lg ${hoverBg}`}>
                  <Search size={18} />
                </Link>
              )}
              {variant === 'default' && (
                <Link href="/shop/wishlist" className={`p-2.5 ${iconMuted} ${iconHover} transition-colors duration-300 rounded-lg ${hoverBg}`}>
                  <Heart size={18} />
                </Link>
              )}
              <Link href="/shop/cart" className={`relative p-2.5 ${iconMuted} ${iconHover} transition-colors duration-300 rounded-lg ${hoverBg}`}>
                <ShoppingCart size={18} />
                {mounted && cartCount > 0 && (
                  <span className={`absolute top-1 right-1 min-w-4 h-4 ${cartBadgeBg} text-[10px] font-bold rounded-full flex items-center justify-center`}>
                    {cartCount}
                  </span>
                )}
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-1 ml-2">
                      <Link href="/shop/account" className={`p-2.5 ${iconMuted} ${iconHover} transition-colors duration-300 rounded-lg ${hoverBg}`}>
                        <User size={18} />
                      </Link>
                      <button onClick={handleLogout} className={`p-2.5 ${iconMuted} ${iconHover} transition-colors duration-300 rounded-lg ${hoverBg}`} title="Logout">
                        <LogOut size={18} />
                      </button>
                    </div>
                  ) : (
                    <Link href="/auth/login" className={`ml-3 px-5 py-2 text-[13px] font-medium tracking-wide ${btnBg} rounded-sm ${btnBgHover} transition-all duration-300`}>
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden p-2.5 ${mobileIcon} transition-colors z-10`}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed inset-0 z-40 ${mobileMenuBg}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl md:text-3xl font-serif font-semibold tracking-tight transition-colors duration-300 ${
                      pathname === item.href ? mobileTextActive : mobileTextMuted
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="flex items-center gap-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {!loading && !user && (
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className={`px-8 py-3 text-sm font-medium tracking-wide ${btnBg} rounded-sm`}>
                    Sign In
                  </Link>
                )}
                <Link href="/shop/cart" onClick={() => setIsOpen(false)} className={`${iconMuted} ${iconHover} transition-colors`}>
                  <ShoppingCart size={22} />
                </Link>
                {user && (
                  <Link href="/shop/account" onClick={() => setIsOpen(false)} className={`${iconMuted} ${iconHover} transition-colors`}>
                    <User size={22} />
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
