'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Check, X, Trash2, Star } from 'lucide-react'

interface Review { id: string; rating: number; title: string | null; body: string | null; is_approved: boolean; is_verified_purchase: boolean; created_at: string; products: { name: string } | null; user_id: string }

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

  useEffect(() => {
    fetch(`/api/admin/reviews?status=${filter}`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [filter])

  const updateReview = async (id: string, data: any) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setReviews(rs => rs.map(r => r.id === id ? { ...r, ...data } : r))
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete review?')) return
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    setReviews(rs => rs.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-serif font-bold text-black">Reviews</h1><p className="text-sm text-black/20 mt-1">{reviews.length} reviews</p></div>
        <div className="flex border border-black/10">
          {(['pending', 'approved', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 text-xs transition-all ${filter === f ? 'text-black bg-white/10' : 'text-black/20 hover:text-black/40'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="border border-black/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex">{Array.from({ length: 5 }).map((_, si) => <Star key={si} size={12} className={si < r.rating ? 'text-yellow-400/60 fill-yellow-400/60' : 'text-black/10'} />)}</div>
                  <span className="text-sm text-black/50">{r.products?.name || 'Unknown'}</span>
                  {r.is_verified_purchase && <span className="text-[10px] font-mono text-green-400/40 uppercase">Verified</span>}
                </div>
                <div className="flex items-center gap-2">
                  {!r.is_approved && <button onClick={() => updateReview(r.id, { is_approved: true })} className="p-2 text-black/15 hover:text-green-400/60"><Check size={14} /></button>}
                  <button onClick={() => updateReview(r.id, { is_approved: false })} className="p-2 text-black/15 hover:text-yellow-400/60"><X size={14} /></button>
                  <button onClick={() => deleteReview(r.id)} className="p-2 text-black/15 hover:text-red-400/60"><Trash2 size={14} /></button>
                </div>
              </div>
              {r.title && <p className="text-sm text-black/40 mb-1">{r.title}</p>}
              {r.body && <p className="text-xs text-black/25 leading-relaxed">{r.body}</p>}
              <p className="text-[10px] font-mono text-black/10 mt-3">{new Date(r.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
          {reviews.length === 0 && <div className="p-16 text-center"><MessageSquare className="w-10 h-10 mx-auto text-black/10 mb-4" /><p className="text-black/15 text-sm">No reviews</p></div>}
        </div>
      )}
    </div>
  )
}
