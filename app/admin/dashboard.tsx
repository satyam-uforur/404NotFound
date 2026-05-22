'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'

interface Analytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingApprovals: number
  topProducts: any[]
  statusBreakdown: Record<string, number>
}

export default function AdminDashboard({ user }: { user: any }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7days')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/analytics?period=${period}`)
        const data = await response.json()
        setAnalytics(data)
      } catch {} finally { setLoading(false) }
    }
    fetchAnalytics()
  }, [period])

  const fmt = (n: number | undefined | null) => (n ?? 0).toFixed(0)

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif font-semibold text-black mb-2">Dashboard</h1>
        <p className="text-sm text-black/40">Manage orders, products, and analytics</p>
        <div className="flex gap-2 mt-6">
          {['7days', '30days', '90days', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium transition-all ${
                period === p
                  ? 'bg-black text-white'
                  : 'text-black/40 hover:text-black/60 border border-black/10'
              }`}
            >
              {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : p === '90days' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      ) : analytics ? (
        <>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {[
              { icon: ShoppingCart, label: 'Total Orders', value: analytics.totalOrders ?? 0 },
              { icon: TrendingUp, label: 'Revenue', value: `₹${fmt(analytics.totalRevenue)}` },
              { icon: BarChart3, label: 'Avg Value', value: `₹${fmt(analytics.averageOrderValue)}` },
              { icon: AlertCircle, label: 'Pending', value: analytics.pendingApprovals ?? 0, highlighted: (analytics.pendingApprovals ?? 0) > 0 },
            ].map((card, idx) => (
              <div key={idx} className={`bg-white p-6 ${card.highlighted ? 'border border-black/20' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono text-black/30 tracking-[0.15em] uppercase">{card.label}</p>
                  <card.icon size={16} className="text-black/15" />
                </div>
                <p className={`text-2xl font-semibold ${card.highlighted ? 'text-black' : 'text-black/60'}`}>{card.value}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-px bg-black/10 mb-8">
            <div className="bg-white p-6">
              <h2 className="text-sm font-medium text-black/40 mb-6">Top Products</h2>
              {(analytics.topProducts ?? []).length === 0 ? (
                <p className="text-black/20 text-xs">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {(analytics.topProducts ?? []).map((product: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                      <div>
                        <p className="text-sm text-black/60">{product.name}</p>
                        <p className="text-[10px] text-black/25">{product.sold} sold</p>
                      </div>
                      <div className="w-20 bg-black/5 h-1">
                        <div className="bg-black/25 h-1" style={{ width: `${(product.sold / Math.max(...(analytics.topProducts ?? [{sold:1}]).map((p: any) => p.sold || 1))) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-6">
              <h2 className="text-sm font-medium text-black/40 mb-6">Order Status</h2>
              {Object.keys(analytics.statusBreakdown ?? {}).length === 0 ? (
                <p className="text-black/20 text-xs">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(analytics.statusBreakdown ?? {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-black/40 capitalize">{status.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-black/50 bg-black/5 px-3 py-1">{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(analytics.pendingApprovals ?? 0) > 0 && (
            <motion.div className="border border-black/10 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-black/60">Pending Approvals</h3>
                  <p className="text-xs text-black/30 mt-1">{analytics.pendingApprovals} orders awaiting review</p>
                </div>
                <a href="/admin/orders" className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-black/80 transition-all">
                  Review
                </a>
              </div>
            </motion.div>
          )}
        </>
      ) : null}
    </div>
  )
}
