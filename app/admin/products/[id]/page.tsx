'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Star, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Archive this product?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/products')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
  if (!product) return <p className="text-black/30">Product not found</p>

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-black/20 hover:text-black/60 text-sm"><ArrowLeft size={14} /> Products</Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-black">{product.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/products/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 text-black/30 text-sm hover:text-black/60"><Pencil size={14} /> Edit</Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 text-black/15 text-sm hover:text-red-400/60"><Trash2 size={14} /> Archive</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {product.image_url && <img src={product.image_url} alt="" className="w-full max-w-md aspect-square object-cover border border-black/5" />}
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {(product.images as string[]).slice(1, 5).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-20 h-20 object-cover border border-black/5" />
              ))}
            </div>
          )}
          <p className="text-sm text-black/40">{product.description}</p>
          {product.long_description && <p className="text-xs text-black/25 leading-relaxed">{product.long_description}</p>}
        </div>

        <div className="space-y-4">
          <div className="border border-black/5 p-5 space-y-3">
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Price</span><span className="text-sm text-black/50">₹{product.price}</span></div>
            {product.mrp && <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">MRP</span><span className="text-sm text-black/30 line-through">₹{product.mrp}</span></div>}
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Stock</span><span className="text-sm text-black/50">{product.stock}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">SKU</span><span className="text-sm text-black/30">{product.sku || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Type</span><span className="text-sm text-black/30">{product.product_type}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Status</span><span className="text-sm text-black/30">{product.status}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Category</span><span className="text-sm text-black/30">{product.categories?.name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-mono text-black/15">Featured</span><span className="text-sm text-black/30">{product.featured ? 'Yes' : 'No'}</span></div>
          </div>

          {product.tags?.length > 0 && (
            <div className="border border-black/5 p-5">
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Tags</span>
              <div className="flex flex-wrap gap-1">
                {product.tags.map((tag: string) => <span key={tag} className="px-2 py-1 text-[10px] bg-white/5 text-black/30">{tag}</span>)}
              </div>
            </div>
          )}

          {product.product_variants?.length > 0 && (
            <div className="border border-black/5">
              <div className="p-4 border-b border-black/5"><span className="text-[10px] font-mono text-black/15 uppercase">Variants ({product.product_variants.length})</span></div>
              <div className="divide-y divide-black/5 max-h-60 overflow-y-auto">
                {product.product_variants.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      {v.color_hex && <div className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: v.color_hex }} />}
                      <span className="text-xs text-black/40">{v.size} / {v.color || 'Default'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-black/30">{v.price ? `₹${v.price}` : '—'}</span>
                      <span className="text-xs text-black/20">{v.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
