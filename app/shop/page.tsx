'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

const FEATURED_DROPS = [
  { id: '1', name: 'Signal Noise', category: 'Cyberpunk', price: 799, image: null },
  { id: '2', name: 'Error 404', category: 'Internet Humor', price: 699, image: null },
  { id: '3', name: 'Neon Devotion', category: 'Devotional', price: 899, image: null },
  { id: '4', name: 'Glitch Garden', category: 'Anime', price: 749, image: null },
]

const CURATED_CATEGORIES = [
  { name: 'Music', symbol: 'SND', description: 'Sound, rhythm, bass culture' },
  { name: 'Meme Culture', symbol: 'CHS', description: 'Internet chaos, distilled' },
  { name: 'Gaming', symbol: 'PLY', description: 'Level up your fit' },
  { name: 'Anime', symbol: 'WLD', description: 'Aesthetic worlds' },
  { name: 'Coding', symbol: 'BLD', description: 'Built different' },
  { name: 'Devotional', symbol: 'DVT', description: 'Digital devotion' },
  { name: 'Cyberpunk', symbol: 'NEN', description: 'Future noir' },
  { name: 'AI & Tech', symbol: 'FTR', description: 'Tomorrow wear' },
]

function DropCard({ drop, index }: { drop: typeof FEATURED_DROPS[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/products/${drop.id}`}>
        <div className="group relative overflow-hidden bg-card border border-border hover:border-foreground/20 transition-all duration-500 cursor-pointer">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />
            <span className="text-foreground/10 text-8xl font-serif font-bold group-hover:text-foreground/20 transition-colors duration-500">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
                {drop.category}
              </span>
              <span className="text-sm text-foreground/50 font-medium">
                ₹{drop.price}
              </span>
            </div>
            <h3 className="text-lg font-medium text-foreground/70 group-hover:text-foreground transition-colors duration-300">
              {drop.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ShopPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="bg-background min-h-screen pt-20">
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
              Digital Archive
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground tracking-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            The Collection
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Curated drops for every frequency. Browse the archive.
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              href="/shop/products"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all duration-300"
            >
              Browse All Products
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="px-6 md:px-10 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12">
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
              Latest Drops
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_DROPS.map((drop, i) => (
              <DropCard key={drop.id} drop={drop} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
              Browse by Culture
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {CURATED_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/shop/products?category=${cat.name.toLowerCase()}`}>
                  <div className="group bg-background p-8 md:p-10 hover:bg-muted transition-all duration-500 cursor-pointer">
                    <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-6">
                      {cat.symbol}
                    </span>
                    <h3 className="text-xl font-medium text-foreground/60 group-hover:text-foreground transition-colors duration-500 mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
