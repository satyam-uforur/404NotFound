'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, X, Trash2 } from 'lucide-react'
import { ImageUploader } from '@/components/admin/ImageUploader'

interface Banner { id: string; title: string | null; subtitle: string | null; image_url: string | null; link_url: string | null; display_order: number; is_active: boolean }
const EMPTY = { title: '', subtitle: '', image_url: '', link_url: '', display_order: 0, is_active: true }

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/banners').then(r => r.json()).then(d => setBanners(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, image_url: form.image_url || null, link_url: form.link_url || null }
      await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setShowForm(false); setForm(EMPTY)
      const updated = await fetch('/api/admin/banners').then(r => r.json())
      setBanners(Array.isArray(updated) ? updated : [])
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete banner?')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    setBanners(bs => bs.filter(b => b.id !== id))
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) })
    setBanners(bs => bs.map(b => b.id === id ? { ...b, is_active: !isActive } : b))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-serif font-bold text-black">Banners</h1><p className="text-sm text-black/20 mt-1">{banners.length} banners</p></div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium hover:bg-white/90"><Plus size={14} /> Add Banner</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border border-black/5 p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-black/20 uppercase">New Banner</span>
              <button type="button" onClick={() => setShowForm(false)} className="text-black/20 hover:text-black/60"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Link URL" value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="Display Order" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40">{saving ? 'Saving...' : 'Create Banner'}</button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="border border-black/5 overflow-hidden">
              {b.image_url && <img src={b.image_url} alt="" className="w-full h-40 object-cover" />}
              <div className="p-5">
                <p className="text-sm text-black/50">{b.title || 'Untitled'}</p>
                {b.subtitle && <p className="text-xs text-black/25 mt-1">{b.subtitle}</p>}
                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => toggleActive(b.id, b.is_active)} className={`text-[10px] font-mono uppercase ${b.is_active ? 'text-green-400/60' : 'text-black/10'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-black/15 hover:text-red-400/60"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
          {banners.length === 0 && <div className="p-16 text-center col-span-2"><Megaphone className="w-10 h-10 mx-auto text-black/10 mb-4" /><p className="text-black/15 text-sm">No banners yet</p></div>}
        </div>
      )}
    </div>
  )
}
