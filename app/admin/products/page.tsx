'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; price: number; mrp: number | null; stock: number; is_active: boolean; status: string; featured: boolean; product_type: string; image_url: string | null;
  categories: { name: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/products?limit=100&status=all')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d?.products) ? d.products : Array.isArray(d) ? d : []
        setProducts(list)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this product?')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) setProducts(ps => ps.filter(p => p.id !== id))
    } catch {}
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Products</h1>
          <p className="text-sm text-black/30 mt-1">{products.length} products</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-sm font-medium hover:bg-black/80 transition-all">
          <Plus size={14} /> Add Product
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-transparent border border-black/10 text-black text-sm placeholder:text-black/25 focus:outline-none focus:border-black/30 w-64" />
        </div>
        <div className="flex border border-black/10">
          {['all', 'active', 'draft', 'archived'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 text-xs transition-all ${statusFilter === s ? 'text-white bg-black' : 'text-black/30 hover:text-black/50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-black/5 divide-y divide-black/5">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between p-5 hover:bg-black/[0.02] transition-all">
              <div className="flex items-center gap-4">
                {product.image_url ? <img src={product.image_url} alt="" className="w-10 h-10 object-cover" /> : <div className="w-10 h-10 bg-black/5" />}
                <div>
                  <p className="text-sm text-black/60">{product.name}</p>
                  <p className="text-[10px] font-mono text-black/25 mt-1">
                    {product.categories?.name || 'Uncategorized'} &middot; {product.product_type} &middot; {product.sku || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-black/40">₹{product.price}</span>
                  {product.mrp && product.mrp > product.price && <span className="text-[10px] text-black/20 line-through ml-2">₹{product.mrp}</span>}
                </div>
                <span className={`text-sm font-mono ${product.stock === 0 ? 'text-red-500/70' : product.stock <= 5 ? 'text-yellow-600/70' : 'text-black/25'}`}>
                  {product.stock}
                </span>
                {product.featured && <span className="text-[10px] font-mono text-black/20 uppercase">Featured</span>}
                <span className={`text-[10px] font-mono uppercase ${product.is_active ? 'text-black/25' : 'text-black/15'}`}>
                  {product.status || (product.is_active ? 'active' : 'inactive')}
                </span>
                <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-black/20 hover:text-black/50 transition-colors"><Pencil size={14} /></Link>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-black/20 hover:text-red-500/60 transition-colors"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="p-16 text-center"><Package className="w-10 h-10 mx-auto text-black/10 mb-4" /><p className="text-black/25 text-sm">No products found</p></div>
          )}
        </div>
      )}
    </div>
  )
}
