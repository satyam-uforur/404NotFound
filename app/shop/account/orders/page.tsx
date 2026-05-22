'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/supabase/useAuth'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch {} finally { setLoading(false) }
    }
    fetchOrders()
  }, [user])

  if (loading) return <div className="text-muted-foreground text-sm">Loading orders...</div>

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight mb-8">Orders</h1>
      {orders.length === 0 ? (
        <div className="border border-border p-16 text-center bg-card">
          <p className="text-foreground/10 text-sm mb-6">No orders yet</p>
          <Link href="/shop/products" className="px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {orders.map((order: any, i: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-5 border-b border-border hover:bg-muted transition-all"
            >
              <div>
                <p className="text-sm text-foreground/50 font-medium">{order.id?.slice(0, 8).toUpperCase()}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground/40">₹{order.total?.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{order.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
