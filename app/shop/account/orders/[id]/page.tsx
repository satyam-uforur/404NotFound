'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/lib/supabase/useAuth'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400/80 border-yellow-500/20',
  payment_confirmed: 'bg-blue-500/10 text-blue-400/80 border-blue-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400/80 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400/80 border-purple-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400/80 border-cyan-500/20',
  delivered: 'bg-green-500/10 text-green-400/80 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400/80 border-red-500/20',
  payment_failed: 'bg-red-500/10 text-red-400/80 border-red-500/20',
  refunded: 'bg-orange-500/10 text-orange-400/80 border-orange-500/20',
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'payment_confirmed', label: 'Payment Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const TIMELINE_INDEX: Record<string, number> = {
  pending: 0,
  payment_confirmed: 1,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  payment_failed: -1,
  refunded: -1,
}

function formatCurrency(amount: number) {
  return '₹' + amount.toLocaleString('en-IN')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const colorClass =
    STATUS_COLORS[status] || 'bg-foreground/10 text-foreground/60 border-foreground/20'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono tracking-[0.15em] uppercase border ${colorClass}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function TimelineTracker({ status }: { status: string }) {
  const currentIndex = TIMELINE_INDEX[status] ?? -1
  const isCancelled = status === 'cancelled' || status === 'payment_failed'
  const isRefunded = status === 'refunded'

  if (isCancelled || isRefunded) {
    return (
      <div className="border border-border p-6 bg-card">
        <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">
          Status
        </span>
        <div
          className={`flex items-center gap-2 ${
            isCancelled ? 'text-red-400/60' : 'text-orange-400/60'
          }`}
        >
          {isCancelled ? (
            <>
              <Clock size={14} />
              <span className="text-sm font-mono tracking-wide">
                Order {isCancelled ? 'Cancelled' : 'Refunded'}
              </span>
            </>
          ) : (
            <>
              <CreditCard size={14} />
              <span className="text-sm font-mono tracking-wide">Refunded</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border p-6 bg-card">
      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-6">
        Order Progress
      </span>

      <div className="relative">
        {TIMELINE_STEPS.map((step, i) => {
          const isActive = i <= currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border transition-colors duration-300 flex-shrink-0 ${
                    isCurrent
                      ? 'bg-foreground/80 border-foreground/80'
                      : isActive
                      ? 'bg-foreground/40 border-foreground/40'
                      : 'bg-transparent border-foreground/15'
                  }`}
                />
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-px h-8 transition-colors duration-300 ${
                      i < currentIndex ? 'bg-foreground/30' : 'bg-foreground/10'
                    }`}
                  />
                )}
              </div>
              <div className="pt-[-2px]">
                <span
                  className={`text-xs font-mono tracking-wide transition-colors duration-300 ${
                    isCurrent
                      ? 'text-foreground/70'
                      : isActive
                      ? 'text-foreground/40'
                      : 'text-foreground/20'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data)
      } catch {
        setError('Could not load order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [user, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
            Loading
          </p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <motion.div
        className="text-center py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Package className="w-10 h-10 mx-auto text-foreground/10 mb-6" />
        <p className="text-foreground/30 text-sm mb-6">
          {error || 'Order not found'}
        </p>
        <Link
          href="/shop/account/orders"
          className="inline-flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase hover:text-foreground/60 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Orders
        </Link>
      </motion.div>
    )
  }

  const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase()
  const items = order.order_items || order.items || []
  const shipping = order.shipping_address || null
  const billing = order.billing_address || null
  const subtotal = order.subtotal ?? 0
  const shippingCost = order.shipping_cost ?? 0
  const tax = order.tax ?? 0
  const discount = order.discount ?? 0
  const totalAmount = order.total_amount ?? order.total ?? 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Link
        href="/shop/account/orders"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground/60 transition-colors text-sm font-mono tracking-wide mb-8"
      >
        <ArrowLeft size={14} />
        Orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
            Order {orderNumber}
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase mt-2">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={order.status} />
          {order.payment_status && (
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.1em] uppercase">
              {order.payment_status}
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">
              Items ({items.length})
            </span>
            <div className="border border-border divide-y divide-border bg-card">
              {items.map((item: any, i: number) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-foreground/70 font-medium">
                      {item.product_name || item.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {item.size && (
                        <span className="text-[10px] font-mono text-muted-foreground tracking-wide">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[10px] font-mono text-muted-foreground tracking-wide">
                          Color: {item.color}
                        </span>
                      )}
                      {item.variant_id && (
                        <span className="text-[10px] font-mono text-foreground/20 tracking-wide">
                          {item.variant_id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                      Qty: {item.quantity} &times;{' '}
                      {formatCurrency(item.price_per_unit || item.price || 0)}
                    </p>
                  </div>
                  <span className="text-sm text-foreground/50 font-mono flex-shrink-0">
                    {formatCurrency(item.total_price || (item.price || 0) * (item.quantity || 1))}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8"
          >
            {shipping && (
              <div className="border border-border p-6 bg-card">
                <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">
                  Shipping Address
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm text-foreground/60">
                    {shipping.full_name || shipping.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.street_address || shipping.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.city}, {shipping.state}{' '}
                    {shipping.postal_code}
                  </p>
                  {shipping.phone && (
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {shipping.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {billing && (
              <div className="border border-border p-6 bg-card">
                <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-4">
                  Billing Address
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm text-foreground/60">
                    {billing.full_name || billing.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {billing.street_address || billing.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {billing.city}, {billing.state}{' '}
                    {billing.postal_code}
                  </p>
                  {billing.phone && (
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {billing.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="border border-border p-6 bg-card sticky top-28">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-6">
                Order Summary
              </span>

              <div className="space-y-3 pb-6 border-b border-border mb-6">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Subtotal</span>
                  <span className="text-foreground/50">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Shipping</span>
                  <span className="text-foreground/50">
                    {shippingCost === 0 ? (
                      <span className="text-foreground/30">Free</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Tax</span>
                  <span className="text-foreground/50">
                    {formatCurrency(tax)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Discount</span>
                    <span className="text-foreground/40">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-mono text-foreground/40">Total</span>
                <span className="text-2xl font-serif text-foreground/90">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <TimelineTracker status={order.status} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
