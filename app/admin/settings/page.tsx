'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '404NotFoundIN',
    storeDescription: 'Premium digital culture platform',
    currency: 'INR',
    taxRate: '18',
    freeShippingAbove: '1000',
    shippingCost: '100',
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-black">Settings</h1>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40">
          <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="border border-black/5 divide-y divide-white/5">
        <div className="p-6">
          <span className="text-[10px] font-mono text-black/15 tracking-[0.2em] uppercase block mb-4">Store</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Store Name</label>
              <input type="text" value={settings.storeName} onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Currency</label>
              <input type="text" value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Description</label>
            <input type="text" value={settings.storeDescription} onChange={e => setSettings(s => ({ ...s, storeDescription: e.target.value }))}
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
          </div>
        </div>

        <div className="p-6">
          <span className="text-[10px] font-mono text-black/15 tracking-[0.2em] uppercase block mb-4">Tax & Shipping</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Tax %</label>
              <input type="number" value={settings.taxRate} onChange={e => setSettings(s => ({ ...s, taxRate: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Free Shipping Above (₹)</label>
              <input type="number" value={settings.freeShippingAbove} onChange={e => setSettings(s => ({ ...s, freeShippingAbove: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Shipping Cost (₹)</label>
              <input type="number" value={settings.shippingCost} onChange={e => setSettings(s => ({ ...s, shippingCost: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black text-sm focus:outline-none focus:border-black/30" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <span className="text-[10px] font-mono text-black/15 tracking-[0.2em] uppercase block mb-4">Payment Gateway</span>
          <div>
            <label className="text-[10px] font-mono text-black/20 uppercase block mb-2">Razorpay Key ID</label>
            <input type="text" value={settings.razorpayKeyId} readOnly
              className="w-full px-0 py-3 bg-transparent border-b border-black/10 text-black/30 text-sm focus:outline-none" />
            <p className="text-[10px] text-black/10 mt-1">Set via environment variable RAZORPAY_KEY_ID</p>
          </div>
        </div>
      </div>
    </div>
  )
}
