'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ArrowLeft, ShoppingCart, Minus, Plus, Tag, X, Loader2 } from 'lucide-react'
import { useCartStore, type CartItem as CartItemType } from '@/lib/store/cartStore'
import { useAuth } from '@/lib/supabase/useAuth'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const coupon = useCartStore((s) => s.coupon)
  const setCoupon = useCartStore((s) => s.setCoupon)
  const clearCoupon = useCartStore((s) => s.clearCoupon)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const syncWithDB = useCartStore((s) => s.syncWithDB)

  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.id) {
      syncWithDB(user.id)
    }
  }, [user?.id, syncWithDB])

  const handleQuantityChange = useCallback(
    (item: CartItemType, newQty: number) => {
      if (newQty < 1) {
        removeItem(item.id, item.size, item.color)
        return
      }
      updateQuantity(item.id, item.size ?? '', item.color ?? '', newQty)
    },
    [removeItem, updateQuantity]
  )

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim()
    if (!code) return

    setCouponLoading(true)
    setCouponError('')

    try {
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cart_total: subtotal }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code')
        return
      }

      setCoupon(data.coupon)
      setCouponInput('')
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }, [couponInput, items, setCoupon])

  const handleRemoveCoupon = useCallback(() => {
    clearCoupon()
    setCouponInput('')
    setCouponError('')
  }, [clearCoupon])

  if (!mounted) return null

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = coupon?.discount ?? 0
  const afterDiscount = subtotal - discount
  const shipping = afterDiscount > 1000 ? 0 : 100
  const tax = Math.round(afterDiscount * 0.18)
  const total = afterDiscount + shipping + tax

  const hasOutOfStock = items.some(
    (item) => item.stock !== undefined && item.stock <= 0
  )

  const getStockStatus = (item: CartItemType) => {
    if (item.stock === undefined) return null
    if (item.stock <= 0) return 'out'
    if (item.stock < item.quantity) return 'low'
    return null
  }

  const formatVariant = (item: CartItemType) => {
    const parts: string[] = []
    if (item.size) parts.push(`Size: ${item.size}`)
    if (item.color) parts.push(`Color: ${item.color}`)
    return parts.join(' / ')
  }

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center pt-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-8xl font-serif font-bold text-foreground/[0.03] mb-6">
            <ShoppingCart className="w-16 h-16 mx-auto text-foreground/10" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground/60 mb-3">
            Cart is Empty
          </h1>
          <p className="text-foreground/30 text-sm mb-10">
            Nothing here yet. Explore the archive.
          </p>
          <Link
            href="/shop/products"
            className="inline-block px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all"
          >
            Browse Products
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-8">
        <div className="max-w-[1400px] mx-auto">
          <Link
            href="/shop/products"
            className="inline-flex items-center gap-2 text-foreground/30 hover:text-foreground/60 transition-colors text-sm mb-8"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight mb-2">
            Cart
          </h1>
          <p className="text-foreground/30 text-sm mb-12">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-px">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => {
                  const stockStatus = getStockStatus(item)

                  return (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-6 py-6 border-b border-border"
                    >
                      <div className="w-20 h-20 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-foreground/10 text-xs font-mono">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground/60 truncate">
                          {item.name}
                        </h3>
                        {(item.size || item.color) && (
                          <p className="text-xs text-foreground/30 mt-1 font-mono">
                            {formatVariant(item)}
                          </p>
                        )}
                        {stockStatus && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-xs mt-2 font-mono ${
                              stockStatus === 'out'
                                ? 'text-red-500'
                                : 'text-orange-400'
                            }`}
                          >
                            {stockStatus === 'out' ? 'Out of stock' : 'Low stock'}
                            {stockStatus === 'low' &&
                              ` — only ${item.stock} available`}
                          </motion.p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="w-8 h-8 border border-border flex items-center justify-center text-foreground/30 hover:text-foreground/50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs text-foreground/50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="w-8 h-8 border border-border flex items-center justify-center text-foreground/30 hover:text-foreground/50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm text-foreground/40 font-medium w-20 text-right">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="p-2 text-foreground/10 hover:text-foreground/40 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border p-6">
                <h2 className="text-[10px] font-mono text-foreground/30 tracking-[0.2em] uppercase mb-4">
                  Coupon Code
                </h2>

                {coupon ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-foreground/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-foreground/30" />
                      <span className="text-sm font-mono text-foreground/50">
                        {coupon.code}
                      </span>
                      <span className="text-xs text-foreground/30">
                        −₹{coupon.discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-foreground/30 hover:text-foreground/50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value)
                          setCouponError('')
                        }}
                        placeholder="Enter code"
                        className="flex-1 bg-transparent border border-border px-3 py-2 text-sm text-foreground/50 placeholder:text-foreground/20 focus:outline-none focus:border-foreground/30 font-mono"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 transition-all disabled:opacity-30"
                      >
                        {couponLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-400 font-mono"
                      >
                        {couponError}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-border p-8 sticky top-28 bg-card">
                <h2 className="text-[10px] font-mono text-foreground/30 tracking-[0.2em] uppercase mb-8">
                  Summary
                </h2>

                <div className="space-y-4 pb-6 border-b border-border mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/30">Subtotal</span>
                    <span className="text-foreground/50">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {coupon && discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/30">Discount</span>
                      <span className="text-foreground/50">
                        −₹{discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/30">Shipping</span>
                    <span className="text-foreground/50">
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/30">Tax (18%)</span>
                    <span className="text-foreground/50">
                      ₹{tax.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-foreground/40 font-medium">Total</span>
                  <span className="text-xl text-foreground font-semibold">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  href="/shop/checkout"
                  className={`block w-full py-4 text-sm font-medium tracking-wide text-center transition-all ${
                    hasOutOfStock
                      ? 'bg-foreground/10 text-foreground/20 cursor-not-allowed pointer-events-none'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                  onClick={(e) => {
                    if (hasOutOfStock) e.preventDefault()
                  }}
                >
                  {hasOutOfStock ? 'Resolve Stock Issues' : 'Checkout'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
