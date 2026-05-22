'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { PRODUCT_TYPES } from '@/lib/validations'

interface Category { id: string; name: string; parent_id: string | null }

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size']
const COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' }, { name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' }, { name: 'Yellow', hex: '#FFFF00' }, { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' }, { name: 'Orange', hex: '#FFA500' }, { name: 'Brown', hex: '#8B4513' },
]

const EMPTY_VARIANT = { size: 'M', color: 'Black', color_hex: '#000000', sku: '', price: null as number | null, mrp: null as number | null, stock: 0, weight: null as number | null, is_active: true }

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'basic' | 'pricing' | 'classification' | 'images' | 'variants' | 'seo' | 'shipping'>('basic')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', long_description: '', sku: '', brand: '',
    price: '', mrp: '', stock: '0', category_id: '', product_type: 't-shirt',
    status: 'active', is_active: true, featured: false,
    tags: [] as string[], tagInput: '',
    meta_title: '', meta_description: '',
    weight: '', dimensions: { length: '', width: '', height: '' },
    low_stock_threshold: '5', tax_percent: '18',
  })

  const [thumbnail, setThumbnail] = useState<{ url: string; public_id?: string } | null>(null)
  const [gallery, setGallery] = useState<{ url: string; public_id?: string }[]>([])
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim().toLowerCase())) {
      setForm(f => ({ ...f, tags: [...f.tags, f.tagInput.trim().toLowerCase()], tagInput: '' }))
    }
  }

  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  const addVariant = () => setVariants(v => [...v, { ...EMPTY_VARIANT }])

  const removeVariant = (i: number) => setVariants(vs => vs.filter((_, idx) => idx !== i))

  const updateVariant = (i: number, field: string, value: any) => {
    setVariants(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  const generateAllCombinations = () => {
    const selectedSizes = SIZES.slice(0, 4)
    const selectedColors = COLORS.slice(0, 4)
    const combos = selectedSizes.flatMap(size => selectedColors.map(color => ({
      size, color: color.name, color_hex: color.hex, sku: '', price: null, mrp: null, stock: 0, weight: null, is_active: true
    })))
    setVariants(combos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const thumbnailUrl = thumbnail?.url || null
      const galleryUrls = gallery.map(img => img.url)
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        long_description: form.long_description || null,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        sku: form.sku || null,
        brand: form.brand || null,
        stock: parseInt(form.stock) || 0,
        category_id: form.category_id || null,
        product_type: form.product_type,
        status: form.status,
        is_active: form.is_active,
        featured: form.featured,
        tags: form.tags,
        image_url: thumbnailUrl,
        images: galleryUrls,
        weight: form.weight ? parseFloat(form.weight) : null,
        dimensions: form.dimensions.length ? { length: parseFloat(form.dimensions.length), width: parseFloat(form.dimensions.width), height: parseFloat(form.dimensions.height) } : null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        tax_percent: parseFloat(form.tax_percent) || 18,
        variants: variants.map(v => ({
          ...v,
          price: v.price ?? parseFloat(form.price),
          mrp: v.mrp ?? (form.mrp ? parseFloat(form.mrp) : null),
        })),
      }
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(typeof d.error === 'string' ? d.error : JSON.stringify(d.error)) }
      router.push('/admin/products')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const topCategories = categories.filter(c => !c.parent_id)
  const subCategories = categories.filter(c => c.parent_id === form.category_id)

  const tabs = [
    { key: 'basic', label: 'Basic' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'classification', label: 'Classification' },
    { key: 'images', label: 'Images' },
    { key: 'variants', label: 'Variants' },
    { key: 'seo', label: 'SEO' },
    { key: 'shipping', label: 'Shipping' },
  ] as const

  const inputCls = "w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40"

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-black/30 hover:text-black/60 text-sm"><ArrowLeft size={14} /> Products</Link>
      <h1 className="text-3xl font-serif font-bold text-black">New Product</h1>

      {error && <div className="p-3 border border-red-500/30 text-red-600 text-xs bg-red-50">{error}</div>}

      <div className="flex gap-1 border-b border-black/10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-xs font-medium transition-all ${tab === t.key ? 'text-black border-b-2 border-black' : 'text-black/25 hover:text-black/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tab === 'basic' && (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Product Name *</label>
              <input type="text" placeholder="Enter product name" value={form.name} required
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || generateSlug(e.target.value) }))}
                className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Slug (auto-generated)</label>
              <input type="text" placeholder="auto-generated-from-name" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Short Description *</label>
              <textarea placeholder="Brief product description" value={form.description} required rows={2}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className={inputCls + " resize-none"} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Long Description</label>
              <textarea placeholder="Detailed product description" value={form.long_description} rows={4}
                onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))}
                className={inputCls + " resize-none"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">SKU</label>
                <input type="text" placeholder="e.g. TSHIRT-001" value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Brand</label>
                <input type="text" placeholder="e.g. 404NotFound" value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-black/50 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-black" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-black/50 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-black" /> Active
              </label>
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Tags</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/5 text-black/50 border border-black/10">
                    {tag} <button type="button" onClick={() => removeTag(tag)} className="text-black/25 hover:text-black/60"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Type a tag and press Enter" value={form.tagInput}
                  onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-0 py-2 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40" />
                <button type="button" onClick={addTag} className="px-3 py-2 text-xs text-black/40 border border-black/10 hover:text-black/60">Add</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Selling Price (₹) *</label>
                <input type="number" placeholder="e.g. 599" value={form.price} required step="0.01" min="0"
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">MRP (₹)</label>
                <input type="number" placeholder="e.g. 999" value={form.mrp} step="0.01" min="0"
                  onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>
            {form.price && form.mrp && parseFloat(form.mrp) > parseFloat(form.price) && (
              <p className="text-xs text-green-700 font-medium">
                ₹{form.price} selling vs ₹{form.mrp} MRP — {Math.round((1 - parseFloat(form.price) / parseFloat(form.mrp)) * 100)}% discount
              </p>
            )}
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Stock Quantity</label>
              <input type="number" placeholder="e.g. 50" value={form.stock} min="0"
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Low Stock Alert At</label>
                <input type="number" placeholder="e.g. 5" value={form.low_stock_threshold} min="0"
                  onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Tax %</label>
                <input type="number" placeholder="e.g. 18" value={form.tax_percent} step="0.01" min="0" max="100"
                  onChange={e => setForm(f => ({ ...f, tax_percent: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {tab === 'classification' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Category</span>
              <div className="flex flex-wrap gap-2">
                {topCategories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category_id: f.category_id === cat.id ? '' : cat.id }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.category_id === cat.id ? 'border-black text-black bg-black/5' : 'border-black/10 text-black/30 hover:text-black/50'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            {subCategories.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Subcategory</span>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                      className={`px-3 py-1.5 text-xs border transition-all ${form.category_id === cat.id ? 'border-black text-black bg-black/5' : 'border-black/10 text-black/30 hover:text-black/50'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Product Type</span>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_TYPES.map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, product_type: type }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.product_type === type ? 'border-black text-black bg-black/5' : 'border-black/10 text-black/30 hover:text-black/50'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Status</span>
              <div className="flex gap-2">
                {(['draft', 'active', 'archived'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${form.status === s ? 'border-black text-black bg-black/5' : 'border-black/10 text-black/30 hover:text-black/50'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Thumbnail (Main Image)</span>
              <p className="text-[10px] text-black/20 mb-3">This is the product image shown on homepage, shop listing, and cards everywhere.</p>
              <ImageUploader images={thumbnail ? [thumbnail] : []} onChange={imgs => setThumbnail(imgs[0] || null)} max={1} folder="404notfound/products" />
            </div>
            <div className="border-t border-black/5 pt-6">
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Gallery (Product Detail Page)</span>
              <p className="text-[10px] text-black/20 mb-3">Additional images shown on the product detail page (front view, back view, close-up, etc.).</p>
              <ImageUploader images={gallery} onChange={setGallery} max={5} folder="404notfound/products" />
            </div>
            <div className="border-t border-black/5 pt-6">
              <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-3">Or paste image URLs</span>
              <div className="space-y-2">
                <input type="text" placeholder="Thumbnail URL" value={thumbnail?.url || ''}
                  onChange={e => setThumbnail(e.target.value ? { url: e.target.value } : null)}
                  className={inputCls} />
                <textarea placeholder="Gallery URLs (one per line)" rows={3}
                  onChange={e => {
                    const urls = e.target.value.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
                    setGallery(urls.map(u => ({ url: u })))
                  }}
                  className={inputCls + " resize-none"} />
              </div>
            </div>
          </div>
        )}

        {tab === 'variants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-black/40 uppercase">{variants.length} variants</span>
              <div className="flex gap-2">
                <button type="button" onClick={generateAllCombinations} className="px-3 py-1.5 text-xs text-black/30 border border-black/10 hover:text-black/50">Auto-generate (4×4)</button>
                <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-black/40 border border-black/10 hover:text-black/60"><Plus size={10} /> Add Variant</button>
              </div>
            </div>
            {variants.length > 0 && (
              <div className="border border-black/10 divide-y divide-black/5">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 flex-wrap">
                    <select value={v.size || ''} onChange={e => updateVariant(i, 'size', e.target.value)}
                      className="px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none">
                      <option value="" className="bg-white">Size</option>
                      {SIZES.map(s => <option key={s} value={s} className="bg-white">{s}</option>)}
                    </select>
                    <select value={v.color || ''} onChange={e => { const c = COLORS.find(cl => cl.name === e.target.value); updateVariant(i, 'color', e.target.value); if (c) updateVariant(i, 'color_hex', c.hex) }}
                      className="px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none">
                      <option value="" className="bg-white">Color</option>
                      {COLORS.map(c => <option key={c.name} value={c.name} className="bg-white">{c.name}</option>)}
                    </select>
                    {v.color_hex && <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: v.color_hex }} />}
                    <input type="text" placeholder="SKU" value={v.sku || ''} onChange={e => updateVariant(i, 'sku', e.target.value)}
                      className="w-20 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                    <input type="number" placeholder="Price" value={v.price || ''} onChange={e => updateVariant(i, 'price', parseFloat(e.target.value) || null)}
                      className="w-20 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                    <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 bg-transparent border border-black/10 text-black text-xs focus:outline-none" />
                    <button type="button" onClick={() => removeVariant(i)} className="p-1 text-black/20 hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            {variants.length === 0 && <p className="text-xs text-black/20 text-center py-8">No variants added. Customers won&apos;t see size/color options. Click &quot;Auto-generate&quot; or &quot;Add Variant&quot; above.</p>}
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Meta Title (max 60 chars)</label>
              <input type="text" placeholder="SEO title for search engines" value={form.meta_title} maxLength={60}
                onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/40 uppercase tracking-widest block mb-1">Meta Description (max 160 chars)</label>
              <textarea placeholder="SEO description for search engines" value={form.meta_description} maxLength={160} rows={2}
                onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                className={inputCls + " resize-none"} />
            </div>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="bg-gray-900 rounded-lg p-6 space-y-5">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-4">Shipping Details</span>
            <div>
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Weight (grams)</label>
              <input type="number" placeholder="e.g. 250" value={form.weight} step="0.01" min="0"
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Length (cm)</label>
                <input type="number" placeholder="0" value={form.dimensions.length} step="0.1"
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, length: e.target.value } }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Width (cm)</label>
                <input type="number" placeholder="0" value={form.dimensions.width} step="0.1"
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, width: e.target.value } }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Height (cm)</label>
                <input type="number" placeholder="0" value={form.dimensions.height} step="0.1"
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, height: e.target.value } }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving || !form.name || !form.price}
          className="w-full py-4 bg-black text-white text-sm font-medium hover:bg-black/80 transition-all disabled:opacity-40">
          {saving ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
