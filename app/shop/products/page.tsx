'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, Search, SlidersHorizontal, X, Grid3X3, LayoutList, Loader2 } from 'lucide-react'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlistStore'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  categories: { name: string } | null
  tags?: { name: string }[] | null
  images: string[] | null
  image_url: string | null
}

interface ApiResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

const CATEGORIES = [
  'All', 'Music', 'Gaming', 'Anime', 'Coding', 'Meme Culture', 'Devotional',
  'Cyberpunk', 'Creator Merch', 'Vintage Web', 'AI & Tech', 'Minimal',
  'Internet Humor', 'Trending',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'name', label: 'Name: A → Z' },
]

const LIMIT = 20

function getProductImage(product: Product): string | null {
  if (product.image_url) {
    return product.image_url
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0]
  }
  return null
}

function ProductCard({ product, index, isWishlisted, onToggleWishlist, viewMode }: {
  product: Product
  index: number
  isWishlisted: boolean
  onToggleWishlist: (item: WishlistItem) => void
  viewMode: 'grid' | 'list'
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })
  const imageUrl = getProductImage(product)
  const categoryName = product.categories?.name || 'Uncategorized'

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.03, duration: 0.5 }}
      >
        <Link href={`/shop/products/${product.id}`}>
          <div className="group flex items-center gap-6 p-4 border-b border-border hover:bg-muted transition-all duration-500 cursor-pointer">
            <div className="w-20 h-20 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-foreground/10 font-mono text-xs">{String(index + 1).padStart(2, '0')}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-foreground/70 group-hover:text-foreground transition-colors truncate">
                {product.name}
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase">{categoryName}</span>
            </div>
            <span className="text-sm text-foreground/40 font-medium">₹{product.price}</span>
            <button
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.categories?.name || 'Uncategorized',
                  image: getProductImage(product) || '',
                })
              }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <ArrowRight size={14} className="text-foreground/0 group-hover:text-foreground/30 transition-all" />
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/products/${product.id}`}>
        <div className="group relative overflow-hidden border border-border hover:border-foreground/20 transition-all duration-500 cursor-pointer bg-card">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <span className="text-foreground/[0.06] text-7xl font-serif font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

            <button
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.categories?.name || 'Uncategorized',
                  image: getProductImage(product) || '',
                })
              }}
              className="absolute top-4 right-4 p-2.5 bg-background/80 backdrop-blur-sm border border-border text-foreground/50 hover:text-foreground transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-medium tracking-wide">
                Quick View <ArrowRight size={12} />
              </span>
            </div>
          </div>

          <div className="p-5">
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase">
              {categoryName}
            </span>
            <h3 className="text-base font-medium text-foreground/60 group-hover:text-foreground transition-colors duration-300 mt-1.5 mb-3">
              {product.name}
            </h3>
            <span className="text-sm text-foreground/40 font-medium">₹{product.price}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SkeletonCard({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-6 p-4 border-b border-border animate-pulse">
        <div className="w-20 h-20 bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted w-3/4" />
          <div className="h-3 bg-muted w-1/4" />
        </div>
        <div className="h-4 bg-muted w-16" />
      </div>
    )
  }

  return (
    <div className="animate-pulse">
      <div className="border border-border bg-card">
        <div className="aspect-[3/4] bg-muted" />
        <div className="p-5 space-y-3">
          <div className="h-2.5 bg-muted w-1/3" />
          <div className="h-4 bg-muted w-3/4" />
          <div className="h-3.5 bg-muted w-1/4" />
        </div>
      </div>
    </div>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const initialCategory = searchParams.get('category') || 'All'
  const initialSearch = searchParams.get('search') || ''
  const initialSort = searchParams.get('sort') || 'newest'
  const initialTags = searchParams.get('tags') || ''

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState(initialSort)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTags ? initialTags.split(',').filter(Boolean) : []
  )
  const [availableTags, setAvailableTags] = useState<string[]>([])

  const wishlist = useWishlistStore()
  const [mounted, setMounted] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleWishlist = useCallback((item: WishlistItem) => {
    wishlist.toggleItem(item)
  }, [wishlist])

  const updateURL = useCallback((params: {
    category?: string
    search?: string
    sort?: string
    tags?: string[]
  }) => {
    const sp = new URLSearchParams()
    const cat = params.category ?? selectedCategory
    const search = params.search ?? searchQuery
    const sort = params.sort ?? sortBy
    const tags = params.tags ?? selectedTags

    if (cat && cat !== 'All') sp.set('category', cat)
    if (search) sp.set('search', search)
    if (sort && sort !== 'newest') sp.set('sort', sort)
    if (tags.length > 0) sp.set('tags', tags.join(','))

    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [selectedCategory, searchQuery, sortBy, selectedTags, router, pathname])

  const fetchProducts = useCallback(async (
    opts: {
      category?: string
      search?: string
      sort?: string
      tags?: string[]
      pageNum?: number
      append?: boolean
    } = {}
  ) => {
    const {
      category = selectedCategory,
      search = searchQuery,
      sort = sortBy,
      tags = selectedTags,
      pageNum = 1,
      append = false,
    } = opts

    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    if (!append) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      params.set('page', String(pageNum))
      params.set('limit', String(LIMIT))
      if (category && category !== 'All') params.set('category', category)
      if (search) params.set('search', search)
      if (sort) params.set('sort', sort)
      if (tags.length > 0) params.set('tags', tags.join(','))

      const res = await fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data: ApiResponse = await res.json()

      if (!res.ok) {
        console.error('[Products] API error:', data)
        if (!append) setProducts([])
      } else {
        const fetched = data.products || []
        if (append) {
          setProducts((prev) => [...prev, ...fetched])
        } else {
          setProducts(fetched)
        }
        setTotal(data.total ?? 0)
        setPage(data.page ?? pageNum)
        setHasMore(fetched.length >= LIMIT && ((append ? products.length : 0) + fetched.length) < (data.total ?? 0))
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('[Products] Fetch failed:', err)
      if (!append) setProducts([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedCategory, searchQuery, sortBy, selectedTags, products.length])

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat)
    setPage(1)
    updateURL({ category: cat })
    fetchProducts({ category: cat, pageNum: 1 })
  }, [fetchProducts, updateURL])

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort)
    setPage(1)
    updateURL({ sort })
    fetchProducts({ sort, pageNum: 1 })
  }, [fetchProducts, updateURL])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      updateURL({ search: value })
      fetchProducts({ search: value, pageNum: 1 })
    }, 400)
  }, [fetchProducts, updateURL])

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      setPage(1)
      updateURL({ tags: next })
      fetchProducts({ tags: next, pageNum: 1 })
      return next
    })
  }, [fetchProducts, updateURL])

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProducts({ pageNum: nextPage, append: true })
  }, [page, fetchProducts])

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('All')
    setSearchQuery('')
    setSortBy('newest')
    setSelectedTags([])
    setPage(1)
    router.replace(pathname, { scroll: false })
    fetchProducts({
      category: 'All',
      search: '',
      sort: 'newest',
      tags: [],
      pageNum: 1,
    })
  }, [fetchProducts, router, pathname])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchProducts({ pageNum: 1 })
  }, [mounted])

  useEffect(() => {
    const allTags = new Set<string>()
    products.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          if (t?.name) allTags.add(t.name)
        })
      }
    })
    setAvailableTags((prev) => {
      const merged = new Set([...prev, ...allTags])
      return Array.from(merged).sort()
    })
  }, [products])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  if (!mounted) return null

  const activeFilterCount = [
    selectedCategory !== 'All',
    selectedTags.length > 0,
  ].filter(Boolean).length

  return (
    <div className="bg-background min-h-screen pt-20">
      <section className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
              {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''}`}
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Products
          </motion.h1>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/20 transition-colors w-48"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-300 border relative ${
                  showFilters ? 'border-foreground/20 text-foreground bg-secondary' : 'border-border text-muted-foreground hover:text-foreground/60'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 flex items-center justify-center bg-foreground text-background text-[10px] font-mono">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground/40'}`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground/40'}`}
                >
                  <LayoutList size={14} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2.5 bg-muted border border-border text-foreground text-sm focus:outline-none appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background">{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden mb-10"
              >
                <div className="border border-border p-6 md:p-8 bg-card">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-mono text-muted-foreground tracking-[0.2em] uppercase">Filters</span>
                    <button
                      onClick={handleClearFilters}
                      className="text-[11px] text-muted-foreground hover:text-foreground/50 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">Category</span>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-3 py-1.5 text-xs transition-all duration-300 border ${
                              selectedCategory === cat
                                ? 'border-foreground/20 text-foreground bg-secondary'
                                : 'border-border text-muted-foreground hover:text-foreground/50 hover:border-foreground/15'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {availableTags.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagToggle(tag)}
                              className={`px-3 py-1.5 text-xs transition-all duration-300 border ${
                                selectedTags.includes(tag)
                                  ? 'border-foreground/20 text-foreground bg-secondary'
                                  : 'border-border text-muted-foreground hover:text-foreground/50 hover:border-foreground/15'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-3">Active Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-foreground/20 text-foreground bg-secondary"
                          >
                            {tag}
                            <button
                              onClick={() => handleTagToggle(tag)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedTags([])
                            setPage(1)
                            updateURL({ tags: [] })
                            fetchProducts({ tags: [], pageNum: 1 })
                          }}
                          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground/50 transition-colors"
                        >
                          Clear tags
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="border-t border-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} viewMode="list" />
                ))}
              </div>
            )
          ) : products.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      isWishlisted={wishlist.hasItem(product.id)}
                      onToggleWishlist={toggleWishlist}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="border-t border-border">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      isWishlisted={wishlist.hasItem(product.id)}
                      onToggleWishlist={toggleWishlist}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-3 px-8 py-3.5 border border-border text-foreground/50 text-sm hover:text-foreground hover:border-foreground/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {loadingMore && !hasMore && (
                <div className="flex justify-center mt-12">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="text-6xl font-serif font-bold text-foreground/[0.03] mb-6">404</div>
              <p className="text-muted-foreground text-sm mb-6">No products match your filters.</p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 border border-border text-foreground/40 text-sm hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen pt-20 flex items-center justify-center">
          <div className="w-6 h-6 border border-border border-t-foreground rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
