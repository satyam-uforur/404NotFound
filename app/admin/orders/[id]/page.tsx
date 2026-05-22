'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, CheckCircle, XCircle } from 'lucide-react'

const ORDER_STATUSES = ['pending', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/orders?admin=true`)
      .then(r => r.json())
      .then((orders: any[]) => {
        const found = orders.find(o => o.id === id)
        setOrder(found || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const supabase = await (await import('@/lib/supabase/data-server')).createDataClient()
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setOrder((o: any) => ({ ...o, status }))
    } catch {} finally { setUpdating(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
  if (!order) return <div className="text-center py-20"><p className="text-black/30">Order not found</p></div>

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-black/20 hover:text-black/60 text-sm"><ArrowLeft size={14} /> Orders</Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Order {order.order_number?.slice(0, 16)}</h1>
          <p className="text-[10px] font-mono text-black/15 mt-1">{new Date(order.created_at).toLocaleDateString()} &middot; {order.payment_status}</p>
        </div>
        <select value={order.status} onChange={e => updateStatus(e.target.value)} disabled={updating}
          className="px-4 py-2 bg-transparent border border-black/10 text-black text-sm focus:outline-none">
          {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-white">{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-black/5">
            <div className="p-4 border-b border-black/5"><span className="text-[10px] font-mono text-black/15 uppercase">Items</span></div>
            <div className="divide-y divide-white/5">
              {(order.order_items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-black/50">{item.product_name}</p>
                    <p className="text-[10px] font-mono text-black/15">Qty: {item.quantity} {item.size ? `/ ${item.size}` : ''} {item.color ? `/ ${item.color}` : ''}</p>
                  </div>
                  <span className="text-sm text-black/30">₹{item.total_price?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black/5 p-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-black/25">Subtotal</span><span className="text-black/40">₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-black/25">Shipping</span><span className="text-black/40">₹{order.shipping_cost?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-black/25">Tax</span><span className="text-black/40">₹{order.tax?.toLocaleString('en-IN')}</span></div>
            {(order.discount > 0 || order.coupon_discount > 0) && <div className="flex justify-between text-sm"><span className="text-black/25">Discount</span><span className="text-green-400/60">-₹{(order.discount || order.coupon_discount)?.toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between text-sm border-t border-black/5 pt-3"><span className="text-black/40">Total</span><span className="text-black font-semibold">₹{order.total_amount?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          {order.shipping_address && (
            <div className="border border-black/5 p-5">
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Shipping Address</span>
              <p className="text-sm text-black/50">{order.shipping_address.full_name}</p>
              <p className="text-xs text-black/25 mt-1">{order.shipping_address.street_address}</p>
              <p className="text-xs text-black/25">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
              <p className="text-xs text-black/15 mt-1">{order.shipping_address.phone}</p>
            </div>
          )}

          {order.tracking_number && (
            <div className="border border-black/5 p-5">
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Tracking</span>
              <p className="text-sm text-black/50 font-mono">{order.tracking_number}</p>
            </div>
          )}

          <div className="border border-black/5 p-5">
            <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Payment</span>
            <p className="text-sm text-black/50">{order.payment_status}</p>
            {order.razorpay_payment_id && <p className="text-[10px] font-mono text-black/15 mt-1">{order.razorpay_payment_id}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
