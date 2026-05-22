'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { PRODUCT_TYPES } from '@/lib/validations'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size']
const COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' }, { name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' }, { name: 'Yellow', hex: '#FFFF00' }, { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' }, { name: 'Orange', hex: '#FFA500' }, { name: 'Brown', hex: '#8B4513' },
]

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('basic')
  const [categories, setCategories] = useState<any[]>([])

  const [form, setForm] = useState<any>({})
  const [images, setImages] = useState<{ url: string; public_id?: string }[]>([])
  const [thumbnail, setThumbnail] = useState<{ url: string; public_id?: string } | null>(null)
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([product, cats]) => {
      setForm({
        name: product.name || '', slug: product.slug || '', description: product.description || '',
        long_description: product.long_description || '', sku: product.sku || '', brand: product.brand || '',
        price: product.price || '', mrp: product.mrp || '', stock: product.stock || 0,
        category_id: product.category_id || '', product_type: product.product_type || 't-shirt',
        status: product.status || 'active', is_active: product.is_active ?? true, featured: product.featured ?? false,
        tags: product.tags || [], tagInput: '', meta_title: product.meta_title || '', meta_description: product.meta_description || '',
        weight: product.weight || '', low_stock_threshold: product.low_stock_threshold || 5, tax_percent: product.tax_percent || 18,
      })
      setImages((product.images || []).map((url: string) => ({ url })))
      setThumbnail(product.image_url ? { url: product.image_url } : null)
      setVariants(product.product_variants || [])
      setCategories(Array.isArray(cats) ? cats : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addTag = () => {
    if (form.tagInput?.trim() && !form.tags?.includes(form.tagInput.trim().toLowerCase())) {
      setForm((f: any) => ({ ...f, tags: [...(f.tags || []), f.tagInput.trim().toLowerCase()], tagInput: '' }))
    }
  }

  const removeTag = (tag: string) => setForm((f: any) => ({ ...f, tags: (f.tags || []).filter((t: string) => t !== tag) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        mrp: form.mrp || null, sku: form.sku || null, brand: form.brand || null,
        category_id: form.category_id || null, long_description: form.long_description || null,
        image_url: thumbnail?.url || null,
        images: images.map((img: any) => img.url),
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        weight: form.weight ? parseFloat(form.weight) : null,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        tax_percent: parseFloat(form.tax_percent) || 18,
        tagInput: undefined,
        variants,
      }
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(typeof d.error === 'string' ? d.error : JSON.stringify(d.error)) }
      router.push('/admin/products')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>

  const topCategories = categories.filter((c: any) => !c.parent_id)

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-black/20 hover:text-black/60 text-sm"><ArrowLeft size={14} /> Products</Link>
      <h1 className="text-3xl font-serif font-bold text-black">Edit Product</h1>
      {error && <div className="p-3 border border-red-500/20 text-red-400 text-xs">{error}</div>}

      <div className="flex gap-1 border-b border-black/5 overflow-x-auto">
        {['basic', 'pricing', 'classification', 'images', 'variants', 'seo', 'shipping'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-medium transition-all capitalize whitespace-nowrap ${tab === t ? 'text-black border-b-2 border-black' : 'text-black/20 hover:text-black/50'}`}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tab === 'basic' && (
          <div className="space-y-5">
            <input type="text" placeholder="Product Name *" value={form.name} required onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            <textarea placeholder="Short Description *" value={form.description} required rows={2} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30 resize-none" />
            <textarea placeholder="Long Description" value={form.long_description} rows={4} onChange={e => setForm((f: any) => ({ ...f, long_description: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30 resize-none" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="SKU" value={form.sku} onChange={e => setForm((f: any) => ({ ...f, sku: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Brand" value={form.brand} onChange={e => setForm((f: any) => ({ ...f, brand: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-black/30"><input type="checkbox" checked={form.featured} onChange={e => setForm((f: any) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
              <label className="flex items-center gap-2 text-sm text-black/30"><input type="checkbox" checked={form.is_active} onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
            </div>
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Tags</span>
              <div className="flex gap-2 flex-wrap mb-2">
                {(form.tags || []).map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/5 text-black/40 border border-black/5">
                    {tag} <button type="button" onClick={() => removeTag(tag)} className="text-black/20 hover:text-black/60"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Add tag" value={form.tagInput} onChange={e => setForm((f: any) => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-0 py-2 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
                <button type="button" onClick={addTag} className="px-3 py-2 text-xs text-black/30 border border-black/10 hover:text-black/60">Add</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Selling Price (₹) *" value={form.price} required step="0.01" onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="MRP (₹)" value={form.mrp} step="0.01" onChange={e => setForm((f: any) => ({ ...f, mrp: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Stock" value={form.stock} min="0" onChange={e => setForm((f: any) => ({ ...f, stock: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="Tax %" value={form.tax_percent} step="0.01" onChange={e => setForm((f: any) => ({ ...f, tax_percent: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            </div>
          </div>
        )}

        {tab === 'classification' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Category</span>
              <div className="flex flex-wrap gap-2">
                {topCategories.map((cat: any) => (
                  <button key={cat.id} type="button" onClick={() => setForm((f: any) => ({ ...f, category_id: f.category_id === cat.id ? '' : cat.id }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.category_id === cat.id ? 'border-black/30 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Product Type</span>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_TYPES.map((type: string) => (
                  <button key={type} type="button" onClick={() => setForm((f: any) => ({ ...f, product_type: type }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.product_type === type ? 'border-black/30 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-3">Status</span>
              <div className="flex gap-2">
                {['draft', 'active', 'archived'].map(s => (
                  <button key={s} type="button" onClick={() => setForm((f: any) => ({ ...f, status: s }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.status === s ? 'border-black/30 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-4">Thumbnail</span>
              <ImageUploader images={thumbnail ? [thumbnail] : []} onChange={imgs => setThumbnail(imgs[0] || null)} max={1} folder="404notfound/products" />
              <input type="text" placeholder="Or paste URL" value={thumbnail?.url || ''} onChange={e => setThumbnail(e.target.value ? { url: e.target.value } : null)}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30 mt-2" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-black/15 uppercase block mb-4">Gallery</span>
              <ImageUploader images={images} onChange={setImages} max={10} folder="404notfound/products" />
            </div>
          </div>
        )}

        {tab === 'variants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-black/15 uppercase">{variants.length} variants</span>
              <button type="button" onClick={() => setVariants(vs => [...vs, { size: 'M', color: 'Black', color_hex: '#000000', sku: '', price: null, mrp: null, stock: 0, is_active: true }])}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-black/30 border border-black/10 hover:text-black/60"><Plus size={10} /> Add</button>
            </div>
            {variants.map((v, i) => (
              <div key={v.id || i} className="flex items-center gap-3 p-3 border border-black/5 flex-wrap">
                <select value={v.size || ''} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, size: e.target.value } : vv))}
                  className="px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none">
                  {SIZES.map(s => <option key={s} value={s} className="bg-white">{s}</option>)}
                </select>
                <input type="text" placeholder="Color" value={v.color || ''} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, color: e.target.value } : vv))}
                  className="w-20 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                <input type="number" placeholder="Price" value={v.price || ''} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, price: parseFloat(e.target.value) || null } : vv))}
                  className="w-20 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                <input type="number" placeholder="Stock" value={v.stock} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))}
                  className="w-16 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                <button type="button" onClick={() => setVariants(vs => vs.filter((_, idx) => idx !== i))} className="p-1 text-black/15 hover:text-red-400/60"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-5">
            <input type="text" placeholder="Meta Title" value={form.meta_title} maxLength={60} onChange={e => setForm((f: any) => ({ ...f, meta_title: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            <textarea placeholder="Meta Description" value={form.meta_description} maxLength={160} rows={2} onChange={e => setForm((f: any) => ({ ...f, meta_description: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30 resize-none" />
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-5">
            <input type="number" placeholder="Weight (grams)" value={form.weight} step="0.01" onChange={e => setForm((f: any) => ({ ...f, weight: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
          </div>
        )}

        <button type="submit" disabled={saving || !form.name || !form.price}
          className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
