'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Search } from 'lucide-react'

const STATUSES = ['all', 'pending', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

interface Order {
  id: string; order_number: string; status: string; payment_status: string; total_amount: number; created_at: string;
  shipping_address: { full_name: string } | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/orders?admin=true')
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const statusColor = (s: string) => {
    if (s === 'delivered') return 'text-green-400/60'
    if (s === 'cancelled' || s === 'failed') return 'text-red-400/60'
    if (s === 'shipped' || s === 'processing') return 'text-blue-400/60'
    return 'text-black/30'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-black">Orders</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" />
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-transparent border border-black/10 text-black text-sm placeholder:text-black/20 focus:outline-none focus:border-black/30 w-64" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs border transition-all ${statusFilter === s ? 'border-black/20 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div> : (
        <div className="border border-black/5 divide-y divide-white/5">
          {filtered.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all">
                <div>
                  <p className="text-sm text-black/50">{order.order_number?.slice(0, 20)}</p>
                  <p className="text-[10px] font-mono text-black/15 mt-1">
                    {order.shipping_address?.full_name || '—'} &middot; {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-black/40">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-3 justify-end mt-1">
                    <span className={`text-[10px] font-mono uppercase ${statusColor(order.status)}`}>{order.status?.replace('_', ' ')}</span>
                    <span className="text-[10px] font-mono text-black/15">{order.payment_status}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="p-16 text-center"><ShoppingCart className="w-10 h-10 mx-auto text-black/10 mb-4" /><p className="text-black/15 text-sm">No orders found</p></div>
          )}
        </div>
      )}
    </div>
  )
}
