'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Plus, X, Trash2 } from 'lucide-react'

interface Coupon { id: string; code: string; type: string; value: number; min_order_amount: number; max_uses: number | null; used_count: number; starts_at: string | null; expires_at: string | null; is_active: boolean }
const EMPTY = { code: '', type: 'percentage' as const, value: 0, min_order_amount: 0, max_uses: null as number | null, starts_at: '', expires_at: '', is_active: true }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const payload = { ...form, code: form.code.toUpperCase(), starts_at: form.starts_at || null, expires_at: form.expires_at || null, max_uses: form.max_uses || null }
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(JSON.stringify(d.error)) }
      setShowForm(false); setForm(EMPTY)
      const updated = await fetch('/api/admin/coupons').then(r => r.json())
      setCoupons(Array.isArray(updated) ? updated : [])
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete coupon?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    setCoupons(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-serif font-bold text-black">Coupons</h1><p className="text-sm text-black/20 mt-1">{coupons.length} coupons</p></div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium hover:bg-white/90"><Plus size={14} /> Add Coupon</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border border-black/5 p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-black/20 uppercase">New Coupon</span>
              <button type="button" onClick={() => setShowForm(false)} className="text-black/20 hover:text-black/60"><X size={16} /></button>
            </div>
            {error && <div className="p-3 border border-red-500/20 text-red-400 text-xs">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Code *" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none">
                <option value="percentage" className="bg-white">Percentage</option>
                <option value="fixed" className="bg-white">Fixed Amount</option>
              </select>
              <input type="number" placeholder="Value *" value={form.value || ''} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} required
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="Min Order" value={form.min_order_amount || ''} onChange={e => setForm(f => ({ ...f, min_order_amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="number" placeholder="Max Uses" value={form.max_uses || ''} onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) || null }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm placeholder:text-black/15 focus:outline-none focus:border-black/30" />
              <input type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none" />
              <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none" />
            </div>
            <button type="submit" disabled={saving || !form.code} className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40">
              {saving ? 'Saving...' : 'Create Coupon'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div> : (
        <div className="border border-black/5 divide-y divide-white/5">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-5 hover:bg-white/[0.02]">
              <div>
                <p className="text-sm text-black/50 font-mono">{c.code}</p>
                <p className="text-[10px] text-black/15 mt-1">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} off &middot; Used {c.used_count}/{c.max_uses || '∞'}</p>
              </div>
              <div className="flex items-center gap-3">
                {!c.is_active && <span className="text-[10px] font-mono text-black/10 uppercase">Inactive</span>}
                <button onClick={() => handleDelete(c.id)} className="p-2 text-black/15 hover:text-red-400/60"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
          {coupons.length === 0 && <div className="p-16 text-center"><Ticket className="w-10 h-10 mx-auto text-black/10 mb-4" /><p className="text-black/15 text-sm">No coupons yet</p></div>}
        </div>
      )}
    </div>
  )
}
