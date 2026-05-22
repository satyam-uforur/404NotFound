'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Trash2, Check, Pencil } from 'lucide-react'
import { useAuth } from '@/lib/supabase/useAuth'
import { createClient } from '@/lib/supabase/client'

interface Address {
  id: string
  type: string
  full_name: string
  phone: string
  email: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

const EMPTY_FORM = {
  full_name: '',
  phone: '',
  email: '',
  street_address: '',
  city: '',
  state: '',
  postal_code: '',
  address_type: 'Home' as 'Home' | 'Work' | 'Other',
  country: 'India',
}

const TYPE_MAP: Record<string, string> = {
  Home: 'shipping',
  Work: 'billing',
  Other: 'shipping',
}

const TYPE_DISPLAY: Record<string, string> = {
  shipping: 'Home',
  billing: 'Work',
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchAddresses()
  }, [user])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data)
      }
    } catch {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          type: TYPE_MAP[formData.address_type],
          is_default: addresses.length === 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to add address')

      setSuccess('Address added successfully')
      setFormData(EMPTY_FORM)
      setShowForm(false)
      await fetchAddresses()
    } catch {
      setError('Failed to add address. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)

      if (deleteError) throw deleteError

      setSuccess('Address removed')
      await fetchAddresses()
    } catch {
      setError('Failed to delete address')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    if (!user) return
    setUpdatingId(addressId)
    setError(null)

    try {
      const supabase = createClient()
      const { error: err1 } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

      if (err1) throw err1

      const { error: err2 } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)

      if (err2) throw err2

      setSuccess('Default address updated')
      await fetchAddresses()
    } catch {
      setError('Failed to update default address')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">Loading</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div>
          <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase block mb-4">
            {addresses.length} saved
          </span>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
            Addresses
          </h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setError(null)
            setSuccess(null)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground/40 text-xs font-mono tracking-[0.1em] uppercase hover:text-foreground hover:border-foreground/20 transition-all"
        >
          <Plus size={12} />
          Add New
        </button>
      </div>

      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div
              className={`px-4 py-3 text-xs font-mono tracking-wide ${
                error
                  ? 'text-red-400/80 border border-red-400/20 bg-red-400/5'
                  : 'text-foreground/60 border border-foreground/10 bg-foreground/5'
              }`}
            >
              {error || success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10 overflow-hidden"
          >
            <div className="border border-border p-6 md:p-8 bg-card">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase block mb-8">
                New Address
              </span>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors sm:col-span-2"
                  />
                </div>

                <input
                  type="text"
                  name="street_address"
                  placeholder="Address Line 1"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <input
                    type="text"
                    name="postal_code"
                    placeholder="Pincode"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase block mb-3">
                      Type
                    </span>
                    <div className="flex gap-2">
                      {(['Home', 'Work', 'Other'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, address_type: type }))
                          }
                          className={`px-4 py-2 text-xs font-mono tracking-wide transition-all ${
                            formData.address_type === type
                              ? 'bg-foreground text-background'
                              : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormData(EMPTY_FORM)
                    }}
                    className="flex-1 py-3.5 border border-border text-foreground/40 text-sm font-medium hover:text-foreground/70 hover:border-foreground/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all disabled:opacity-40"
                  >
                    {formLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {addresses.length === 0 && !showForm ? (
        <div className="border border-dashed border-border p-16 text-center bg-card">
          <MapPin className="w-8 h-8 mx-auto text-foreground/10 mb-4" />
          <p className="text-muted-foreground text-sm mb-6">
            No saved addresses yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground/30 text-sm hover:text-foreground/60 hover:border-foreground/20 transition-all"
          >
            <Plus size={14} />
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-px">
          {addresses.map((address, i) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="group relative border-b border-border"
            >
              <div className="flex items-start justify-between p-5 md:p-6 hover:bg-muted/50 transition-all">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="mt-0.5">
                    <MapPin
                      size={14}
                      className={
                        address.is_default
                          ? 'text-foreground/40'
                          : 'text-foreground/15'
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-sm font-medium text-foreground/60">
                        {address.full_name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em] uppercase px-2 py-0.5 border border-border">
                        {TYPE_DISPLAY[address.type] || 'Home'}
                      </span>
                      {address.is_default && (
                        <span className="text-[10px] font-mono text-foreground/40 tracking-[0.15em] uppercase flex items-center gap-1">
                          <Check size={10} />
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {address.street_address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} — {address.postal_code}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {address.phone} · {address.email}
                    </p>
                    {address.country && address.country !== 'India' && (
                      <p className="text-xs text-muted-foreground/40 mt-0.5">
                        {address.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={!!updatingId}
                      className="p-2 text-muted-foreground hover:text-foreground/60 transition-colors"
                      title="Set as default"
                    >
                      {updatingId === address.id ? (
                        <div className="w-3.5 h-3.5 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={!!deletingId}
                    className="p-2 text-muted-foreground hover:text-red-400/60 transition-colors"
                    title="Delete address"
                  >
                    {deletingId === address.id ? (
                      <div className="w-3.5 h-3.5 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
