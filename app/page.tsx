'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { InteractiveOrb } from '@/components/InteractiveOrb'
import { BackgroundSignalLayer } from '@/components/BackgroundSignalLayer'

const CHAPTERS = [
  {
    number: '001',
    title: 'SIGNAL FOUND',
    caption: 'Noise became identity.',
    description: 'In the static between frequencies, a new culture emerged. Not designed — discovered.',
  },
  {
    number: '002',
    title: 'DIGITAL ECHO',
    caption: 'Every scroll leaves a memory.',
    description: 'The internet never forgets. Every meme, every moment, every movement — archived forever in the signal.',
  },
  {
    number: '003',
    title: 'CULTURE DROP',
    caption: 'Fashion archived from the internet.',
    description: 'Not merchandise. Digital identity. Wearable memories from the collective consciousness of online culture.',
  },
  {
    number: '004',
    title: 'CHAOS THEORY',
    caption: 'Memes. Motion. Emotion.',
    description: 'Designed from digital chaos. Some cultures are born online. This is theirs.',
  },
  {
    number: '005',
    title: 'FUTURE DEVOTION',
    caption: 'Faith meets the machine.',
    description: 'Where code becomes prayer and pixels become sacred. Future artifacts for modern minds.',
  },
  {
    number: '006',
    title: 'LOST & FOUND',
    caption: '404 was never an error.',
    description: 'It was the beginning. Lost in the feed. Found in the signal. The signal is still alive.',
  },
]

const CATEGORIES = [
  { name: 'Music', symbol: 'SND', href: '/shop?category=music' },
  { name: 'Meme Culture', symbol: 'CHS', href: '/shop?category=memes' },
  { name: 'Gaming', symbol: 'PLY', href: '/shop?category=gaming' },
  { name: 'Anime', symbol: 'WLD', href: '/shop?category=anime' },
  { name: 'Coding', symbol: 'BLD', href: '/shop?category=coding' },
  { name: 'Devotional', symbol: 'DVT', href: '/shop?category=devotional' },
  { name: 'Cyberpunk', symbol: 'NEN', href: '/shop?category=cyberpunk' },
  { name: 'Creator', symbol: 'CRT', href: '/shop?category=creator' },
  { name: 'AI & Tech', symbol: 'FTR', href: '/shop?category=ai' },
  { name: 'Vintage Web', symbol: 'RET', href: '/shop?category=vintage' },
  { name: 'Internet Humor', symbol: 'HMR', href: '/shop?category=humor' },
  { name: 'Minimal', symbol: 'LES', href: '/shop?category=minimal' },
]

const FLOATING_LINES = [
  'Emotion rendered in monochrome.',
  'Not a store. A digital universe.',
  'Built for the endlessly online.',
  'Aesthetic engineered from chaos.',
  'Every drop tells a story.',
  'Internet culture, physically manifested.',
  'Memory fragments turned into design.',
]

interface HomeProduct {
  id: string
  name: string
  slug: string
  price: number
  mrp: number
  image_url: string
  images: string[]
  categories: { name: string }
}

interface HomeBanner {
  title: string
  subtitle: string
  image_url: string
  link_url: string
  display_order: number
}

interface HomeData {
  banners: HomeBanner[]
  featured: HomeProduct[]
  latest: HomeProduct[]
  categories: unknown[]
}

function ProductCard({ product, index }: { product: HomeProduct; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })
  const imageSrc = product.image_url || (product.images && product.images[0]) || ''

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/products/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-3">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-mono text-white/15 tracking-[0.2em] uppercase">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="space-y-1">
          {product.categories?.name && (
            <span className="text-[9px] font-mono text-white/25 tracking-[0.2em] uppercase block">
              {product.categories.name}
            </span>
          )}
          <h3 className="text-xs md:text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors duration-500 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-white/70">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[10px] md:text-xs text-white/25 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function FeaturedProductsSection({ products }: { products: HomeProduct[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  if (!products || products.length === 0) return null

  return (
    <section ref={ref} className="chapter-spacing px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-[10px] md:text-[11px] font-mono text-white/35 tracking-[0.3em] uppercase block mb-3"
            >
              Curated Selection
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight"
            >
              <span className="text-gradient">Featured</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Link
              href="/shop/products"
              className="group inline-flex items-center gap-2 text-[10px] md:text-xs font-mono text-white/35 tracking-[0.15em] uppercase hover:text-white/60 transition-colors duration-500"
            >
              View All
              <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LatestDropsSection({ products }: { products: HomeProduct[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  if (!products || products.length === 0) return null

  return (
    <section ref={ref} className="chapter-spacing px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-[10px] md:text-[11px] font-mono text-white/35 tracking-[0.3em] uppercase block mb-3"
            >
              Fresh from the Signal
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight"
            >
              <span className="text-gradient">Latest Drops</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Link
              href="/shop/products"
              className="group inline-flex items-center gap-2 text-[10px] md:text-xs font-mono text-white/35 tracking-[0.15em] uppercase hover:text-white/60 transition-colors duration-500"
            >
              View All
              <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  const sorted = [...banners].sort((a, b) => a.display_order - b.display_order)
  const active = sorted[current % sorted.length]

  return (
    <section ref={ref} className="chapter-spacing px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href={active.link_url} className="group block relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden border border-white/[0.06]">
            {active.image_url ? (
              <Image
                src={active.image_url}
                alt={active.title}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 1400px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-white/[0.03]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[9px] md:text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase mb-2 md:mb-3"
              >
                Featured
              </motion.span>
              <motion.h2
                key={active.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-3xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-1 md:mb-2"
              >
                {active.title}
              </motion.h2>
              <motion.p
                key={active.subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-xs md:text-sm text-white/50 max-w-md"
              >
                {active.subtitle}
              </motion.p>
            </div>
            {sorted.length > 1 && (
              <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex items-center gap-1.5">
                {sorted.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrent(i)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      i === current ? 'bg-white/70 w-4' : 'bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function ChapterProgressLine({ chapters, activeChapter, progress }: {
  chapters: typeof CHAPTERS
  activeChapter: number
  progress: number
}) {
  return (
    <>
      <div className="fixed right-5 md:right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4">
        <div className="relative flex flex-col items-center gap-0">
          <div className="w-[1px] h-6 bg-white/20" />
          {chapters.map((chapter, i) => {
            const isActive = activeChapter === i
            const isPassed = activeChapter > i
            return (
              <div key={chapter.number} className="flex flex-col items-center">
                <div className="relative flex items-center justify-center group">
                  <span className={`absolute -right-[50px] text-[8px] font-mono tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-700 ${
                    isActive ? 'text-white/50 opacity-100' : 'text-white/0 group-hover:text-white/25'
                  }`}>
                    {chapter.number}
                  </span>
                  <button
                    onClick={() => {
                      const el = document.getElementById(`chapter-${chapter.number}`)
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="relative w-4 h-4 flex items-center justify-center cursor-pointer"
                  >
                    <div className={`w-[3px] h-[3px] rounded-full transition-all duration-700 ${
                      isPassed ? 'bg-white/80 scale-100'
                        : isActive ? 'bg-white scale-[2.5]'
                        : 'bg-white/25 scale-100 group-hover:bg-white/50'
                    }`} />
                    {isActive && (
                      <motion.div
                        layoutId="chapter-ring"
                        className="absolute w-3.5 h-3.5 rounded-full border border-white/30"
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </button>
                </div>
                {i < chapters.length - 1 && (
                  <div className="w-[1px] h-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" />
                    <div
                      className="absolute top-0 left-0 right-0 bg-white/50 transition-all duration-1000 ease-out"
                      style={{ height: `${isPassed ? 100 : isActive ? 50 : 0}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
          <div className="w-[1px] h-6 bg-white/20" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 h-[2px] bg-white/5 md:hidden">
        <div
          className="h-full bg-white/40 transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </>
  )
}

function ChapterSection({ chapter }: { chapter: typeof CHAPTERS[0] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-25%' })
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-15%' })

  return (
    <section
      ref={ref}
      id={`chapter-${chapter.number}`}
      className="chapter-spacing px-5 md:px-10 relative"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
        >
          <div className="md:col-span-2 flex md:flex-col items-start gap-3">
            <span className="text-[10px] md:text-[11px] font-mono text-white/30 tracking-[0.3em] uppercase">
              Chapter {chapter.number}
            </span>
            <div className="hidden md:block w-[1px] h-8 bg-gradient-to-b from-white/25 to-transparent" />
          </div>
          <div className="md:col-span-10">
            <motion.div
              ref={titleRef}
              initial={{ opacity: 0, y: 25 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-serif font-bold tracking-tight leading-[0.9] mb-5 md:mb-6">
                <span className="text-gradient">{chapter.title}</span>
              </h2>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl lg:text-2xl font-light text-white/50 mb-5 md:mb-6 tracking-wide"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.7 }}
            >
              {chapter.caption}
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-white/30 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              {chapter.description}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CategoryGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="chapter-spacing px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="text-[10px] md:text-[11px] font-mono text-white/35 tracking-[0.3em] uppercase">
            Choose your frequency
          </span>
        </motion.div>

        <motion.p
          className="text-xl md:text-3xl font-serif text-white/40 mb-12 md:mb-16 max-w-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          Wear the archive.
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.025, duration: 0.5 }}
            >
              <Link href={cat.href}>
                <div className="group relative border border-white/[0.08] p-6 md:p-8 min-h-[110px] md:min-h-[130px] flex flex-col justify-between cursor-pointer hover:border-white/25 transition-all duration-500 bg-transparent hover:bg-white/[0.02]">
                  <span className="text-[9px] md:text-[10px] font-mono text-white/25 tracking-[0.2em] uppercase">
                    {cat.symbol}
                  </span>
                  <h3 className="text-sm md:text-base font-medium text-white/50 group-hover:text-white/90 transition-colors duration-500">
                    {cat.name}
                  </h3>
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/40 group-hover:w-full transition-all duration-700 ease-out" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ManifestoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-20%' })

  return (
    <section ref={ref} className="py-24 md:py-40 px-5 md:px-10">
      <div className="max-w-[800px] mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-3xl lg:text-5xl font-serif font-light leading-[1.4] tracking-tight"
        >
          <span className="text-white/25">Not a store.</span>
          <br />
          <span className="text-white/45">Not a brand.</span>
          <br />
          <span className="text-white/70">A digital universe.</span>
        </motion.p>
      </div>
    </section>
  )
}

function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-20%' })

  return (
    <section ref={ref} className="chapter-spacing px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="border border-white/[0.08] p-8 md:p-16 lg:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

          <span className="text-[9px] md:text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase block mb-6 md:mb-8 relative z-10">
            Enter the Signal
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 md:mb-4 tracking-tight relative z-10">
            Join the Archive
          </h2>
          <p className="text-white/30 mb-8 md:mb-10 max-w-md mx-auto text-sm md:text-base relative z-10">
            Signal beyond the algorithm. Early access to drops, exclusive collabs, limited releases.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto relative z-10">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 md:py-3.5 bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button className="px-6 py-3 md:py-3.5 bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ScrollIndicator() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setVisible(window.scrollY < 80)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      className="absolute bottom-8 md:bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      animate={{ opacity: visible ? 0.5 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-[8px] md:text-[9px] font-mono text-white/40 tracking-[0.3em] uppercase">
        Scroll
      </span>
      <ChevronDown size={12} className="text-white/30 animate-scroll-indicator" />
    </motion.div>
  )
}

function FloatingCaption({ index }: { index: number }) {
  const text = FLOATING_LINES[index % FLOATING_LINES.length]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40%' })

  return (
    <div ref={ref} className="py-8 md:py-12 px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.5 }}
          className="text-center text-[10px] md:text-xs font-mono text-white/50 tracking-[0.08em]"
        >
          {text}
        </motion.p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const globeOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const textOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.07], [0, -30])

  const [activeChapter, setActiveChapter] = useState(-1)
  const [homeData, setHomeData] = useState<HomeData | null>(null)

  useEffect(() => {
    fetch('/api/home', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setHomeData(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const chapters = document.querySelectorAll('[id^="chapter-"]')
        const scrollPos = window.scrollY + window.innerHeight * 0.45
        let active = -1
        chapters.forEach((ch, i) => {
          if (scrollPos >= ch.offsetTop) active = i
        })
        setActiveChapter(active)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={containerRef} className="bg-black min-h-screen relative">
      <BackgroundSignalLayer />
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          className="w-full"
          style={{ opacity: globeOpacity, willChange: 'opacity' }}
        >
          <InteractiveOrb />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-36 pointer-events-none"
          style={{ opacity: textOpacity, y: textY }}
        >
          <motion.h1
            className="text-[2.5rem] sm:text-[4rem] md:text-8xl lg:text-[9rem] font-serif font-bold text-white tracking-tight leading-none text-center px-4"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            404NOTFOUND
          </motion.h1>

          <motion.p
            className="mt-3 md:mt-4 text-[8px] md:text-[11px] font-mono text-white/35 tracking-[0.25em] md:tracking-[0.3em] uppercase text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Digital culture &middot; Internet identity &middot; Aesthetic drops
          </motion.p>

          <motion.p
            className="mt-2 md:mt-3 text-[10px] md:text-sm font-light text-white/25 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            404 was the beginning.
          </motion.p>

          <motion.div
            className="mt-6 md:mt-8 pointer-events-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 border border-white/20 text-white text-[11px] md:text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-all duration-500"
            >
              Explore the Archive
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        <ScrollIndicator />
      </section>

      <FloatingCaption index={0} />
      <div className="cinematic-divider" />

      {CHAPTERS.map((chapter, i) => (
        <div key={chapter.number}>
          <ChapterSection chapter={chapter} />
          <div className="cinematic-divider" />
          {i < FLOATING_LINES.length - 1 && <FloatingCaption index={i + 1} />}
        </div>
      ))}

      <CategoryGrid />
      <div className="cinematic-divider" />

      <FeaturedProductsSection products={homeData?.featured ?? []} />
      {homeData?.featured && homeData.featured.length > 0 && (
        <div className="cinematic-divider" />
      )}

      <LatestDropsSection products={homeData?.latest ?? []} />
      {homeData?.latest && homeData.latest.length > 0 && (
        <div className="cinematic-divider" />
      )}

      <BannerCarousel banners={homeData?.banners ?? []} />
      {homeData?.banners && homeData.banners.length > 0 && (
        <div className="cinematic-divider" />
      )}

      <ManifestoSection />
      <div className="cinematic-divider" />
      <CTASection />

      <ChapterProgressLine
        chapters={CHAPTERS}
        activeChapter={activeChapter}
        progress={scrollYProgress}
      />
    </div>
  )
}
