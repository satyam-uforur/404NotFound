'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/supabase/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ACCOUNT_NAV = [
  { label: 'Dashboard', href: '/shop/account', icon: User },
  { label: 'Orders', href: '/shop/account/orders', icon: Package },
  { label: 'Wishlist', href: '/shop/wishlist', icon: Heart },
  { label: 'Addresses', href: '/shop/account/addresses', icon: MapPin },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  if (!mounted || loading) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <div className="border border-border p-6 sticky top-28 bg-card">
                <div className="mb-8">
                  <p className="text-sm text-foreground/60 font-medium">{user?.email}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">Member</p>
                </div>
                <nav className="space-y-1">
                  {ACCOUNT_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground/60 hover:bg-muted transition-all"
                    >
                      <item.icon size={14} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-red-400/60 w-full transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </nav>
              </div>
            </div>
            <div className="lg:col-span-9">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
