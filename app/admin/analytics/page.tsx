'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30days')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const metrics = analytics ? [
    { label: 'Revenue', value: `₹${analytics.totalRevenue?.toFixed(0) || '0'}`, icon: DollarSign },
    { label: 'Orders', value: analytics.totalOrders || '0', icon: ShoppingCart },
    { label: 'Avg Value', value: `₹${analytics.averageOrderValue?.toFixed(0) || '0'}`, icon: TrendingUp },
    { label: 'Pending', value: analytics.pendingApprovals || '0', icon: Users },
  ] : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-black">Analytics</h1>
        <div className="flex gap-2">
          {['7days', '30days', '90days', 'all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium transition-all ${period === p ? 'bg-white/10 text-black border border-black/20' : 'text-black/20 border border-black/5 hover:text-black/40'}`}>
              {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : p === '90days' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-black/15 tracking-[0.15em] uppercase">{m.label}</span>
                  <m.icon size={14} className="text-black/10" />
                </div>
                <p className="text-2xl font-semibold text-black/50">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-white/5">
            <div className="bg-white p-6">
              <h2 className="text-sm font-medium text-black/30 mb-6">Top Products</h2>
              {!analytics?.topProducts?.length ? <p className="text-black/10 text-xs">No data</p> : (
                <div className="space-y-3">
                  {analytics.topProducts.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-black/5">
                      <div><p className="text-sm text-black/40">{p.name}</p><p className="text-[10px] text-black/15">{p.sold} sold</p></div>
                      <div className="w-20 bg-white/5 h-1"><div className="bg-white/30 h-1" style={{ width: `${(p.sold / Math.max(...analytics.topProducts.map((x: any) => x.sold))) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-6">
              <h2 className="text-sm font-medium text-black/30 mb-6">Order Status</h2>
              <div className="space-y-3">
                {Object.entries(analytics?.statusBreakdown || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-black/30 capitalize">{status.replace('_', ' ')}</span>
                    <span className="text-xs text-black/40 bg-white/5 px-3 py-1">{count as number}</span>
                  </div>
                ))}
                {(!analytics?.statusBreakdown || Object.keys(analytics.statusBreakdown).length === 0) && <p className="text-black/10 text-xs">No data</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
