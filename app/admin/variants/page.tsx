'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Archive, AlertTriangle } from 'lucide-react'

interface Variant {
  id: string
  product_id: string
  sku: string | null
  size: string | null
  color: string | null
  color_hex: string | null
  price: number | null
  mrp: number | null
  stock: number
  is_active: boolean
  products: { name: string } | null
}

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    fetch('/api/products?limit=100&status=all')
      .then(r => r.json())
      .then(data => {
        const products = data.products || data || []
        const allVariants: Variant[] = []
        products.forEach((p: any) => {
          if (p.product_variants) {
            p.product_variants.forEach((v: any) => {
              allVariants.push({ ...v, products: { name: p.name } })
            })
          }
        })
        setVariants(allVariants)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = variants.filter(v => {
    if (filter === 'low') return v.stock > 0 && v.stock <= 5
    if (filter === 'out') return v.stock === 0
    if (search) {
      const q = search.toLowerCase()
      return (v.products?.name || '').toLowerCase().includes(q) || (v.sku || '').toLowerCase().includes(q) || (v.color || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Variants</h1>
          <p className="text-sm text-black/20 mt-1">{variants.length} total variants</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="text" placeholder="Search variants..." value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-transparent border border-black/10 text-black text-sm placeholder:text-black/20 focus:outline-none focus:border-black/30 w-64" />
        <div className="flex border border-black/10">
          {(['all', 'low', 'out'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs transition-all ${filter === f ? 'text-black bg-white/10' : 'text-black/20 hover:text-black/40'}`}>
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-black/5 divide-y divide-black/5">
          {filtered.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-4">
                {v.color_hex && <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: v.color_hex }} />}
                <div>
                  <p className="text-sm text-black/50">{v.products?.name || 'Unknown'}</p>
                  <p className="text-[10px] font-mono text-black/15">
                    {v.size && `${v.size} / `}{v.color || 'Default'} {v.sku && `&middot; ${v.sku}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-black/30">{v.price ? `₹${v.price}` : '—'}</span>
                <span className={`text-sm font-mono flex items-center gap-1 ${v.stock === 0 ? 'text-red-400/60' : v.stock <= 5 ? 'text-yellow-400/60' : 'text-black/30'}`}>
                  {v.stock <= 5 && v.stock > 0 && <AlertTriangle size={12} />}
                  {v.stock === 0 ? 'Out' : v.stock}
                </span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="p-16 text-center">
              <Archive className="w-10 h-10 mx-auto text-black/10 mb-4" />
              <p className="text-black/15 text-sm">No variants found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
