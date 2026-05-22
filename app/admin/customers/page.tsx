'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Search } from 'lucide-react'

interface Customer { id: string; email: string; full_name: string | null; phone: string | null; role: string; created_at: string }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(d => setCustomers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? customers.filter(c => c.email.toLowerCase().includes(search.toLowerCase()) || (c.full_name || '').toLowerCase().includes(search.toLowerCase()))
    : customers

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Customers</h1>
          <p className="text-sm text-black/20 mt-1">{customers.length} total</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-transparent border border-black/10 text-black text-sm placeholder:text-black/20 focus:outline-none focus:border-black/30 w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-black/5 divide-y divide-black/5">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
              <Link href={`/admin/customers/${c.id}`} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all">
                <div>
                  <p className="text-sm text-black/50">{c.full_name || c.email}</p>
                  <p className="text-[10px] font-mono text-black/15">{c.email} &middot; {c.phone || '—'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-black/15 uppercase">{c.role}</span>
                  <span className="text-[10px] font-mono text-black/10">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="p-16 text-center">
              <Users className="w-10 h-10 mx-auto text-black/10 mb-4" />
              <p className="text-black/15 text-sm">No customers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
