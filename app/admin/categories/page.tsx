'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, ChevronRight, FolderTree } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  parent?: { id: string; name: string; slug: string } | null
  children?: Category[]
}

const EMPTY_FORM = { name: '', slug: '', description: '', image_url: '', parent_id: '', display_order: 0, is_active: true }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : []
        setCategories(cats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, slug: form.slug || generateSlug(form.name), parent_id: form.parent_id || null, image_url: form.image_url || null, description: form.description || null }
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || JSON.stringify(d.error) || 'Failed') }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      const updated = await fetch('/api/admin/categories').then(r => r.json())
      setCategories(Array.isArray(updated) ? updated : [])
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); alert(d.error); return }
      setCategories(cats => cats.filter(c => c.id !== id))
    } catch {}
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '', parent_id: cat.parent_id || '', display_order: cat.display_order, is_active: cat.is_active })
    setShowForm(true)
  }

  const topLevel = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Categories</h1>
          <p className="text-sm text-black/20 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all">
          <Plus size={14} /> Add Category
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="border border-black/5 p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-black/20 tracking-[0.2em] uppercase">{editingId ? 'Edit Category' : 'New Category'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="text-black/20 hover:text-black/60"><X size={16} /></button>
            </div>
            {error && <div className="p-3 border border-red-500/20 text-red-400 text-xs">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || generateSlug(e.target.value) }))} required
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="text" placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="Display Order" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30 resize-none" />
            {topLevel.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-black/15 tracking-[0.15em] uppercase block mb-3">Parent Category</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setForm(f => ({ ...f, parent_id: '' }))}
                    className={`px-3 py-1.5 text-xs border transition-all ${!form.parent_id ? 'border-black/30 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
                    None (Top Level)
                  </button>
                  {topLevel.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, parent_id: cat.id }))}
                      className={`px-3 py-1.5 text-xs border transition-all ${form.parent_id === cat.id ? 'border-black/30 text-black bg-white/10' : 'border-black/5 text-black/20 hover:text-black/40'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={saving || !form.name}
              className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-40">
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-black/5 divide-y divide-black/5">
          {topLevel.map((cat, i) => {
            const children = getChildren(cat.id)
            return (
              <div key={cat.id}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-3">
                    {cat.image_url && <img src={cat.image_url} alt="" className="w-8 h-8 object-cover" />}
                    <div>
                      <p className="text-sm text-black/50">{cat.name}</p>
                      <p className="text-[10px] font-mono text-black/15">{cat.slug} &middot; Order: {cat.display_order}</p>
                    </div>
                    {children.length > 0 && <ChevronRight size={12} className="text-black/15" />}
                  </div>
                  <div className="flex items-center gap-3">
                    {!cat.is_active && <span className="text-[10px] font-mono text-black/10 uppercase">Inactive</span>}
                    <button onClick={() => startEdit(cat)} className="p-2 text-black/15 hover:text-black/40 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-black/15 hover:text-red-400/60 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
                {children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-5 pl-12 hover:bg-white/[0.02] transition-all border-l border-black/5 ml-5">
                    <div>
                      <p className="text-sm text-black/40">{child.name}</p>
                      <p className="text-[10px] font-mono text-black/10">{child.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => startEdit(child)} className="p-2 text-black/15 hover:text-black/40 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(child.id)} className="p-2 text-black/15 hover:text-red-400/60 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
          {topLevel.length === 0 && (
            <div className="p-16 text-center">
              <FolderTree className="w-10 h-10 mx-auto text-black/10 mb-4" />
              <p className="text-black/15 text-sm">No categories yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
