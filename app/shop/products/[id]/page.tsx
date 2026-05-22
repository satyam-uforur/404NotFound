'use client'

import { use, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Heart, ShoppingCart, ArrowLeft, Truck, Shield, RotateCcw, Minus, Plus, Star, ChevronRight } from 'lucide-react'
import { cartStore } from '@/lib/store/cartStore'
import { useWishlistStore } from '@/lib/store/wishlistStore'

interface Variant {
  id: string; size: string | null; color: string | null; color_hex: string | null;
  price: number | null; mrp: number | null; stock: number; is_active: boolean;
}

interface Product {
  id: string; name: string; slug: string; price: number; mrp: number | null;
  categories: { id: string; name: string; slug: string } | null
  description: string; long_description: string | null;
  images: string[] | null; image_url: string | null;
  stock: number; sku: string | null; product_type: string | null;
  product_variants: Variant[]
  tags: string[]
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<any[]>([])
  const [reviewsData, setReviewsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const wishlist = useWishlistStore()

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/products/${id}/related`).then(r => r.json()).catch(() => ({ products: [] })),
      fetch(`/api/reviews?product_id=${id}`).then(r => r.json()).catch(() => null),
    ]).then(([p, rel, rev]) => {
      if (p && !p.error) {
        setProduct(p)
        if (p.product_variants?.length > 0) {
          const firstColor = p.product_variants.find(v => v.is_active)?.color
          const firstSize = p.product_variants.find(v => v.is_active)?.size
          if (firstColor) setSelectedColor(firstColor)
          if (firstSize) setSelectedSize(firstSize)
        }
        const recentlyViewed = JSON.parse(localStorage.getItem('404-recently-viewed') || '[]')
        const filtered = recentlyViewed.filter((rv: any) => rv.id !== p.id)
        filtered.unshift({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || p.image_url, slug: p.slug })
        localStorage.setItem('404-recently-viewed', JSON.stringify(filtered.slice(0, 20)))
      }
      setRelated(rel?.products || [])
      setReviewsData(rev)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="bg-background min-h-screen flex items-center justify-center pt-20"><div className="w-6 h-6 border border-border border-t-foreground rounded-full animate-spin" /></div>
  if (!product) return <div className="bg-background min-h-screen flex items-center justify-center pt-20"><div className="text-center"><div className="text-8xl font-serif font-bold text-foreground/[0.03] mb-6">404</div><p className="text-muted-foreground mb-8">Product not found.</p><Link href="/shop/products" className="px-6 py-3 border border-border text-foreground/40 text-sm hover:text-foreground hover:border-foreground/30 transition-all">Back to Products</Link></div></div>

  const variants = product.product_variants || []
  const activeVariants = variants.filter(v => v.is_active)
  const uniqueSizes = [...new Set(activeVariants.map(v => v.size).filter(Boolean))]
  const uniqueColors = [...new Set(activeVariants.map(v => v.color).filter(Boolean))]
  const colorHexMap: Record<string, string> = {}
  activeVariants.forEach(v => { if (v.color && v.color_hex) colorHexMap[v.color] = v.color_hex })

  const selectedVariant = activeVariants.find(v => v.size === selectedSize && v.color === selectedColor)
    || activeVariants.find(v => v.color === selectedColor)
    || activeVariants[0]

  const isAvailable = (size: string | null, color: string | null) => {
    return activeVariants.some(v => v.is_active && v.stock > 0 && (size === null || v.size === size) && (color === null || v.color === color))
  }

  const effectivePrice = selectedVariant?.price || product.price
  const effectiveMrp = selectedVariant?.mrp || product.mrp
  const effectiveStock = selectedVariant?.stock ?? product.stock

  const allImages: string[] = []
  if (product.image_url) allImages.push(product.image_url)
  if (Array.isArray(product.images)) {
    product.images.forEach((img: string) => {
      if (img && img !== product.image_url) allImages.push(img)
    })
  }
  const colorImages = selectedColor ? activeVariants.filter(v => v.color === selectedColor && v.image_url).map(v => v.image_url!) : []
  const displayImages = colorImages.length > 0 ? colorImages : allImages
  const categoryName = product.categories?.name || 'Uncategorized'

  const handleAddToCart = () => {
    cartStore.addItem({
      id: product.id, name: product.name, price: effectivePrice, quantity,
      size: selectedSize || '', color: selectedColor || '',
      image: product.image_url || (product.images?.[0]) || '', variant_id: selectedVariant?.id,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const isWishlisted = wishlist.hasItem(product.id)

  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-4">
        <div className="max-w-[1400px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground/60">Home</Link>
            <ChevronRight size={10} />
            <Link href="/shop/products" className="hover:text-foreground/60">Shop</Link>
            {product.categories && <><ChevronRight size={10} /><Link href={`/shop/products?category=${product.categories.slug}`} className="hover:text-foreground/60">{categoryName}</Link></>}
            <ChevronRight size={10} />
            <span className="text-foreground/40">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="px-6 md:px-10 py-4 md:py-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="aspect-[3/4] bg-muted border border-border mb-4 overflow-hidden">
                {displayImages[activeImage] ? (
                  <img src={displayImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-foreground/[0.04] text-9xl font-serif font-bold">01</span></div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {displayImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`aspect-square border transition-all duration-300 ${activeImage === i ? 'border-foreground/30 bg-secondary' : 'border-border bg-card hover:border-foreground/20'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">{categoryName}</span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight mt-3 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-2xl text-foreground/50 font-light">₹{effectivePrice}</p>
                  {effectiveMrp && effectiveMrp > effectivePrice && (
                    <>
                      <span className="text-lg text-foreground/20 line-through">₹{effectiveMrp}</span>
                      <span className="text-sm text-green-500/70 font-medium">{Math.round((1 - effectivePrice / effectiveMrp) * 100)}% off</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed font-light">{product.description}</p>

              {uniqueColors.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">Color</span>
                  <div className="flex gap-2">
                    {uniqueColors.map(color => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color ? 'border-foreground/50 scale-110' : 'border-border'}`}
                        title={color}>
                        <div className="w-7 h-7 rounded-full" style={{ backgroundColor: colorHexMap[color] || '#ccc' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uniqueSizes.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">Size</span>
                  <div className="flex gap-2">
                    {uniqueSizes.map(size => {
                      const available = isAvailable(size, selectedColor)
                      return (
                        <button key={size} onClick={() => available && setSelectedSize(size)}
                          className={`w-11 h-11 text-xs font-medium transition-all duration-300 border ${
                            !available ? 'border-border/50 text-foreground/15 cursor-not-allowed line-through' :
                            selectedSize === size ? 'border-foreground/30 text-foreground bg-secondary' :
                            'border-border text-muted-foreground hover:text-foreground/50 hover:border-foreground/20'
                          }`}>
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">Quantity</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground/50"><Minus size={14} /></button>
                  <span className="w-12 text-center text-sm text-foreground/60 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground/50"><Plus size={14} /></button>
                </div>
              </div>

              {effectiveStock <= 5 && effectiveStock > 0 && (
                <p className="text-xs text-orange-400/70 font-medium">Only {effectiveStock} left in stock</p>
              )}
              {effectiveStock === 0 && <p className="text-xs text-red-400/70 font-medium">Out of stock</p>}

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddToCart} disabled={effectiveStock === 0}
                  className={`flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-500 disabled:opacity-30 ${
                    isAdded ? 'bg-secondary text-foreground border border-foreground/20' : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}>
                  <ShoppingCart size={16} /> {isAdded ? 'Added to Cart' : effectiveStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button onClick={() => isWishlisted ? wishlist.removeItem(product.id) : wishlist.addItem({ id: product.id, name: product.name, price: effectivePrice, category: categoryName, image: productImages[0] || '' })}
                  className={`w-14 h-14 border flex items-center justify-center transition-all duration-300 ${
                    isWishlisted ? 'border-foreground/30 text-foreground bg-secondary' : 'border-border text-muted-foreground hover:text-foreground/50'
                  }`}>
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="border-t border-border pt-8 space-y-5">
                {[
                  { icon: Truck, title: 'Free Shipping', desc: 'On prepaid orders over ₹1000' },
                  { icon: Shield, title: 'Secure Checkout', desc: 'Encrypted payment' },
                  { icon: RotateCcw, title: 'Replacement Only', desc: '48hr window for damaged/defective items' },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-4">
                    <item.icon size={16} className="text-muted-foreground flex-shrink-0" />
                    <div><span className="text-sm text-foreground/40 font-medium">{item.title}</span><span className="text-xs text-muted-foreground ml-2">{item.desc}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.slice(0, 4).map((p: any) => (
                  <Link key={p.id} href={`/shop/products/${p.id}`}>
                    <div className="group border border-border hover:border-foreground/20 transition-all overflow-hidden">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {(p.images?.[0] || p.image_url) ? <img src={p.images?.[0] || p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : null}
                      </div>
                      <div className="p-4"><p className="text-sm text-foreground/50">{p.name}</p><p className="text-xs text-foreground/30 mt-1">₹{p.price}</p></div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {reviewsData && reviewsData.totalReviews > 0 && (
            <section className="mt-20">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-serif font-bold text-foreground">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-foreground/50">{reviewsData.averageRating}</span>
                  <span className="text-xs text-muted-foreground">({reviewsData.totalReviews})</span>
                </div>
              </div>
              <div className="space-y-4">
                {(reviewsData.reviews || []).slice(0, 5).map((review: any) => (
                  <div key={review.id} className="border border-border p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-border'} />)}</div>
                      {review.is_verified_purchase && <span className="text-[10px] font-mono text-green-500/70 uppercase">Verified</span>}
                    </div>
                    {review.title && <p className="text-sm text-foreground/50 mb-1">{review.title}</p>}
                    {review.body && <p className="text-xs text-muted-foreground">{review.body}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}
