'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, Tag, X } from 'lucide-react'
import { cartStore, useCartStore, type CartItem } from '@/lib/store/cartStore'
import { useAuth } from '@/lib/supabase/useAuth'
import { useRouter } from 'next/navigation'

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const coupon = useCartStore((s) => s.coupon)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })
  const [mounted, setMounted] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    setMounted(true)
    if (loading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Autofill address
    fetch('/api/addresses')
      .then(r => r.json())
      .then(addresses => {
        const primary = addresses.find((a: any) => a.is_default) || addresses[0]
        if (primary) {
          setFormData({
            firstName: primary.full_name?.split(' ')[0] || '',
            lastName: primary.full_name?.split(' ')[1] || '',
            email: primary.email || user.email || '',
            phone: primary.phone || '',
            streetAddress: primary.street_address || '',
            city: primary.city || '',
            state: primary.state || '',
            postalCode: primary.postal_code || '',
            country: primary.country || 'India',
          })
        } else if (user.email) {
          setFormData(f => ({ ...f, email: user.email! }))
        }
      })
      .catch(() => {})

    const items = cartStore.getItems()
    setCartItems(items)
    if (items.length === 0) router.push('/shop/cart')
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentProcessing(true)
    setPaymentError(null)

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = coupon ? coupon.discount : 0
    const afterDiscount = subtotal - discountAmount
    const tax = Math.round(afterDiscount * 0.18)
    const shippingCost = afterDiscount > 1000 ? 0 : 100
    const totalAmount = afterDiscount + shippingCost + tax

    try {
      const addressResponse = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            street_address: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            type: 'shipping',
            is_default: true,
          }),
      })
      if (!addressResponse.ok) throw new Error('Failed to save shipping address')
      const addressData = await addressResponse.json()

      const formattedItems = cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_sku: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_per_unit: item.price,
        total_price: item.price * item.quantity,
        size: item.size,
        color: item.color,
      }))

      const orderPayload: Record<string, unknown> = {
        items: formattedItems,
        shippingAddressId: addressData.id,
        billingAddressId: addressData.id,
        subtotal,
        tax,
        shippingCost,
        discount: discountAmount,
        totalAmount,
      }
      if (coupon) {
        orderPayload.couponCode = coupon.code
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (!orderResponse.ok) {
        const errData = await orderResponse.json().catch(() => null)
        const msg = errData?.error || 'Failed to create order'
        throw new Error(msg)
      }
      const orderData = await orderResponse.json()
      setOrderId(orderData.id)

      // BYPASS RAZORPAY: Directly clear cart and show success
      cartStore.clearCart()
      setStep('success')
      setPaymentProcessing(false)
      
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
      setPaymentProcessing(false)
    }
  }

  if (!mounted) return null

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = coupon ? coupon.discount : 0
  const afterDiscount = subtotal - discountAmount
  const tax = Math.round(afterDiscount * 0.18)
  const shipping = afterDiscount > 1000 ? 0 : 100
  const total = afterDiscount + shipping + tax

  const inputClass =
    'w-full px-0 py-3 bg-transparent border-b border-border text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors font-mono'

  return (
    <div className="bg-black min-h-screen pt-20">
      <div className="px-6 md:px-10 py-6">
        <div className="max-w-[1400px] mx-auto">
          <Link
            href="/shop/cart"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm font-mono tracking-wide"
          >
            <ArrowLeft size={14} /> Back to Cart
          </Link>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 md:py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-12">
                {['Shipping', 'Payment', 'Confirmation'].map((s, i) => {
                  const stepIdx = step === 'shipping' ? 0 : step === 'payment' ? 1 : 2
                  const active = i <= stepIdx
                  return (
                    <motion.div
                      key={s}
                      className="flex items-center gap-4 flex-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {i > 0 && (
                        <div
                          className={`flex-1 h-px transition-colors duration-500 ${
                            i <= stepIdx ? 'bg-white/30' : 'bg-white/10'
                          }`}
                        />
                      )}
                      <span
                        className={`text-[10px] font-mono tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-300 ${
                          i === stepIdx
                            ? 'text-white/70'
                            : i < stepIdx
                            ? 'text-white/40'
                            : 'text-white/20'
                        }`}
                      >
                        {s}
                      </span>
                      {i < 2 && (
                        <div
                          className={`flex-1 h-px transition-colors duration-500 ${
                            i < stepIdx ? 'bg-white/30' : 'bg-white/10'
                          }`}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {step === 'shipping' && (
                  <motion.form
                    key="shipping"
                    onSubmit={handleShippingSubmit}
                    className="space-y-6"
                    {...fadeIn}
                  >
                    <h2 className="text-3xl font-serif text-white/90 mb-10">Shipping Details</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'firstName', placeholder: 'First Name', type: 'text' },
                        { name: 'lastName', placeholder: 'Last Name', type: 'text' },
                        { name: 'email', placeholder: 'Email', type: 'email' },
                        { name: 'phone', placeholder: 'Phone', type: 'tel' },
                      ].map((field, i) => (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <label className="block text-[10px] font-mono text-white/30 tracking-[0.15em] uppercase mb-1">
                            {field.placeholder}
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleInputChange}
                            required
                            className={inputClass}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-[10px] font-mono text-white/30 tracking-[0.15em] uppercase mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        placeholder="Street Address"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        required
                        className={inputClass}
                      />
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'city', placeholder: 'City' },
                        { name: 'state', placeholder: 'State' },
                        { name: 'postalCode', placeholder: 'Postal Code' },
                      ].map((field, i) => (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                        >
                          <label className="block text-[10px] font-mono text-white/30 tracking-[0.15em] uppercase mb-1">
                            {field.placeholder}
                          </label>
                          <input
                            type="text"
                            name={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleInputChange}
                            required
                            className={inputClass}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full py-4 bg-white text-black text-sm font-medium tracking-wider hover:bg-white/90 transition-all mt-8 font-mono"
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      Continue to Payment
                    </motion.button>
                  </motion.form>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" {...fadeIn}>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <h2 className="text-3xl font-serif text-white/90 mb-10">Payment</h2>

                      <motion.div
                        className="border border-white/10 p-8 bg-white/[0.02]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">
                          Amount Due
                        </span>
                        <p className="text-4xl text-white/90 font-serif mt-3">
                          ₹{total.toLocaleString('en-IN')}
                        </p>
                        {coupon && (
                          <p className="text-xs font-mono text-white/30 mt-2">
                            Coupon &quot;{coupon.code}&quot; applied — ₹
                            {discountAmount.toLocaleString('en-IN')} off
                          </p>
                        )}
                      </motion.div>

                      <AnimatePresence>
                        {paymentError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border border-red-500/20 bg-red-500/5 px-4 py-3"
                          >
                            <p className="text-xs text-red-400/80 font-mono">{paymentError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        className="flex gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          type="button"
                          onClick={() => setStep('shipping')}
                          disabled={paymentProcessing}
                          className="flex-1 py-4 border border-white/10 text-white/30 text-sm font-medium hover:text-white/50 hover:border-white/20 transition-all font-mono"
                        >
                          Back
                        </button>
                        <motion.button
                          type="submit"
                          disabled={paymentProcessing}
                          className="flex-1 py-4 bg-white text-black text-sm font-medium tracking-wider hover:bg-white/90 transition-all disabled:opacity-30 font-mono"
                          whileHover={paymentProcessing ? {} : { scale: 1.005 }}
                          whileTap={paymentProcessing ? {} : { scale: 0.995 }}
                        >
                          {paymentProcessing ? 'Processing...' : 'Pay Now'}
                        </motion.button>
                      </motion.div>
                    </form>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    className="text-center py-20"
                    {...fadeIn}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                      <CheckCircle className="w-16 h-16 text-white/20 mx-auto mb-8" />
                    </motion.div>
                    <motion.h2
                      className="text-4xl font-serif text-white/90 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Order Confirmed
                    </motion.h2>
                    <motion.p
                      className="text-white/40 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Confirmation sent to{' '}
                      <span className="text-white/50">{formData.email}</span>
                    </motion.p>
                    {orderId && (
                      <motion.p
                        className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        Order {orderId.slice(0, 8).toUpperCase()}
                      </motion.p>
                    )}
                    <motion.div
                      className="flex flex-col sm:flex-row gap-3 justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Link
                        href="/shop/account/orders"
                        className="px-8 py-4 bg-white text-black text-sm font-medium tracking-wider hover:bg-white/90 transition-all font-mono"
                      >
                        View Orders
                      </Link>
                      <Link
                        href="/shop/products"
                        className="px-8 py-4 border border-white/10 text-white/30 text-sm font-medium hover:text-white/50 hover:border-white/20 transition-all font-mono"
                      >
                        Continue Shopping
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4">
              <motion.div
                className="border border-white/10 p-8 sticky top-28 bg-white/[0.02]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 pb-6 border-b border-white/10 mb-6 max-h-60 overflow-y-auto scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                      {item.image && (
                        <div className="w-12 h-12 bg-white/5 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">{item.name}</p>
                        <div className="flex gap-2 mt-0.5">
                          {item.size && (
                            <span className="text-[10px] font-mono text-white/30">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] font-mono text-white/30">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-white/40 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs text-white/50 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                {coupon && (
                  <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-4">
                    <Tag size={12} className="text-white/30" />
                    <span className="text-[10px] font-mono text-white/40 tracking-wide flex-1">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] font-mono text-white/50">
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="space-y-3 pb-6 border-b border-white/10 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-white/30">Subtotal</span>
                    <span className="text-white/50">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {coupon && discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-white/30">Discount</span>
                      <span className="text-white/40">
                        -₹{discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-white/30">Shipping</span>
                    <span className="text-white/50">
                      {shipping === 0 ? (
                        <span className="text-white/30">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-white/30">Tax (18%)</span>
                    <span className="text-white/50">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-white/40">Total</span>
                  <span className="text-2xl font-serif text-white/90">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
