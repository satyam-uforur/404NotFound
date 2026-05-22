'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, XCircle, History } from 'lucide-react'

export default function InventoryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-black">Inventory</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        <div className="bg-white p-6">
          <span className="text-[10px] font-mono text-black/15 tracking-[0.15em] uppercase">Low Stock</span>
          <p className="text-2xl font-semibold text-yellow-400/60 mt-2">{data?.summary?.lowStockCount || 0}</p>
        </div>
        <div className="bg-white p-6">
          <span className="text-[10px] font-mono text-black/15 tracking-[0.15em] uppercase">Out of Stock</span>
          <p className="text-2xl font-semibold text-red-400/60 mt-2">{data?.summary?.outOfStockCount || 0}</p>
        </div>
      </div>

      {data?.lowStock?.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-black/30 mb-4 flex items-center gap-2"><AlertTriangle size={14} /> Low Stock Items</h2>
          <div className="border border-black/5 divide-y divide-black/5">
            {data.lowStock.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-black/50">{item.name}</p>
                  <p className="text-[10px] font-mono text-black/15">{item.sku || '—'}</p>
                </div>
                <span className="text-sm font-mono text-yellow-400/60">{item.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.outOfStock?.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-black/30 mb-4 flex items-center gap-2"><XCircle size={14} /> Out of Stock</h2>
          <div className="border border-black/5 divide-y divide-black/5">
            {data.outOfStock.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-black/50">{item.name}</p>
                  <p className="text-[10px] font-mono text-black/15">{item.sku || '—'}</p>
                </div>
                <span className="text-sm font-mono text-red-400/60">0</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.recentLogs?.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-black/30 mb-4 flex items-center gap-2"><History size={14} /> Recent Activity</h2>
          <div className="border border-black/5 divide-y divide-black/5">
            {data.recentLogs.slice(0, 20).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-black/40">{log.products?.name || '—'}</p>
                  <p className="text-[10px] font-mono text-black/15">{log.change_type} &middot; {log.reason || ''}</p>
                </div>
                <span className={`text-sm font-mono ${log.quantity_change > 0 ? 'text-green-400/60' : 'text-red-400/60'}`}>
                  {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data?.lowStock?.length && !data?.outOfStock?.length && (
        <div className="border border-black/5 p-16 text-center">
          <Package className="w-10 h-10 mx-auto text-black/10 mb-4" />
          <p className="text-black/15 text-sm">All items are well stocked</p>
        </div>
      )}
    </div>
  )
}
