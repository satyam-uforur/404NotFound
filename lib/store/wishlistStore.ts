'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  category: string
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  isSynced: boolean
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  toggleItem: (item: WishlistItem) => void
  hasItem: (id: string) => boolean
  clearAll: () => void
  syncWithDB: (userId: string) => Promise<void>
  setIsSynced: (v: boolean) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isSynced: false,

      addItem: (item: WishlistItem) => {
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        })
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      toggleItem: (item: WishlistItem) => {
        const { items } = get()
        if (items.some((i) => i.id === item.id)) {
          set({ items: items.filter((i) => i.id !== item.id) })
        } else {
          set({ items: [...items, item] })
        }
      },

      hasItem: (id: string) => {
        return get().items.some((i) => i.id === id)
      },

      clearAll: () => {
        set({ items: [] })
      },

      setIsSynced: (v) => set({ isSynced: v }),

      syncWithDB: async (userId: string) => {
        try {
          const res = await fetch('/api/wishlist')
          if (!res.ok) return
          const dbItems = await res.json()

          const mapped: WishlistItem[] = (dbItems || []).map((item: any) => ({
            id: item.products?.id || item.product_id,
            name: item.products?.name || '',
            price: item.products?.price || 0,
            category: item.products?.categories?.name || 'Uncategorized',
            image: item.products?.image_url || '',
          }))

          const localItems = get().items

          for (const local of localItems) {
            if (!mapped.some((m) => m.id === local.id)) {
              try {
                await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: local.id }),
                })
              } catch {}
              mapped.push(local)
            }
          }

          set({ items: mapped, isSynced: true })
        } catch {
          set({ isSynced: true })
        }
      },
    }),
    {
      name: '404notfound-wishlist',
    }
  )
)
