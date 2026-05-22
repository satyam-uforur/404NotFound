'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useAuth } from '@/lib/supabase/useAuth'
import { useState, useEffect } from 'react'

export default function WishlistPage() {
  const wishlist = useWishlistStore()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && !wishlist.isSynced) {
      wishlist.syncWithDB(user.id)
    }
  }, [user])

  if (!mounted) return null

  if (wishlist.isSynced === false && user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center pt-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Heart className="w-12 h-12 mx-auto text-foreground/10 mb-6 animate-pulse" />
          <p className="text-muted-foreground text-sm">Syncing your wishlist...</p>
        </motion.div>
      </div>
    )
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center pt-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heart className="w-12 h-12 mx-auto text-foreground/10 mb-6" />
          <h1 className="text-2xl font-serif font-bold text-foreground/50 mb-3">Wishlist Empty</h1>
          <p className="text-muted-foreground text-sm mb-10">Save items you love for later.</p>
          <Link
            href="/shop/products"
            className="px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all"
          >
            Browse Products
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase block mb-6">
            {wishlist.items.length} saved
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight mb-12">
            Wishlist
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/shop/products/${item.id}`}>
                  <div className="group border border-border hover:border-foreground/20 transition-all duration-500 overflow-hidden bg-card">
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-foreground/[0.04] text-6xl font-serif font-bold">{String(i + 1).padStart(2, '0')}</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          wishlist.removeItem(item.id)
                        }}
                        className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground/60 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase">{item.category}</span>
                      <h3 className="text-sm font-medium text-foreground/50 group-hover:text-foreground transition-colors mt-1">{item.name}</h3>
                      <span className="text-xs text-foreground/30 mt-2 block">₹{item.price}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
