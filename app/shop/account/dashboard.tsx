'use client'

import { motion } from 'framer-motion'
import { Package, Heart, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/supabase/useAuth'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useState, useEffect } from 'react'

interface Order {
  id: string
  order_number: string
  status: string
  created_at: string
  total_amount: number
}

export default function AccountDashboard() {
  const { user } = useAuth()
  const wishlist = useWishlistStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const ordersCount = orders.length
  const wishlistCount = wishlist.items.length
  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const recentOrders = orders.slice(0, 3)

  const stats = [
    { icon: Package, label: 'Orders', value: loading ? '...' : String(ordersCount), href: '/shop/account/orders' },
    { icon: Heart, label: 'Wishlist', value: String(wishlistCount), href: '/shop/wishlist' },
    { icon: CreditCard, label: 'Total Spent', value: loading ? '...' : `₹${totalSpent.toLocaleString('en-IN')}`, href: '#' },
  ]

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border mb-12">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-background p-8 hover:bg-muted transition-all group">
              <stat.icon size={16} className="text-foreground/10 mb-4" />
              <p className="text-2xl font-semibold text-foreground/30 group-hover:text-foreground/60 transition-colors">{stat.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase mt-2">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border border-border p-8 bg-card">
        <h2 className="text-sm font-medium text-foreground/30 mb-6">Recent Activity</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/10 text-sm">Loading orders...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/10 text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-0">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/shop/account/orders/${order.id}`}>
                <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors px-2">
                  <div>
                    <p className="text-sm font-medium text-foreground/50">#{order.order_number}</p>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/30">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase mt-1">{order.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
