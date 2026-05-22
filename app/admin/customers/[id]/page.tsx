'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Package } from 'lucide-react'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then(r => r.json())
      .then(setCustomer)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border border-black/20 border-t-black rounded-full animate-spin" /></div>
  if (!customer) return <p className="text-black/30">Customer not found</p>

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-black/20 hover:text-black/60 text-sm"><ArrowLeft size={14} /> Customers</Link>
      <h1 className="text-3xl font-serif font-bold text-black">{customer.full_name || customer.email}</h1>

      <div className="border border-black/5 divide-y divide-black/5">
        <div className="flex items-center gap-3 p-5"><Mail size={14} className="text-black/20" /><span className="text-sm text-black/50">{customer.email}</span></div>
        {customer.phone && <div className="flex items-center gap-3 p-5"><Phone size={14} className="text-black/20" /><span className="text-sm text-black/50">{customer.phone}</span></div>}
        <div className="flex items-center gap-3 p-5"><span className="text-[10px] font-mono text-black/15">Joined {new Date(customer.created_at).toLocaleDateString()} &middot; Role: {customer.role}</span></div>
      </div>

      <h2 className="text-sm font-medium text-black/30 mt-8">Orders ({customer.orders?.length || 0})</h2>
      {customer.orders?.length > 0 ? (
        <div className="border border-black/5 divide-y divide-black/5">
          {customer.orders.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-black/50">{order.order_number?.slice(0, 16)}</p>
                <p className="text-[10px] font-mono text-black/15">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black/40">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-mono text-black/15 uppercase">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-black/10 text-sm">No orders yet</p>}
    </div>
  )
}
