'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  variant_id?: string
  stock?: number
}

interface CartStore {
  items: CartItem[]
  coupon: { code: string; type: string; value: number; discount: number } | null
  isSynced: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  setCoupon: (coupon: CartStore['coupon']) => void
  clearCoupon: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getItems: () => CartItem[]
  syncWithDB: (userId: string) => Promise<void>
  mergeLocalToDB: (userId: string) => Promise<void>
  setIsSynced: (v: boolean) => void
  subscribe: (callback: (items: CartItem[]) => void) => () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isSynced: false,

      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.size === item.size && i.color === item.color
          )

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return { items: [...state.items, item] }
        })
      },

      removeItem: (id: string, size?: string, color?: string) => {
        set((state) => ({
          items: state.items.filter((item) =>
            !(item.id === id && (!size || item.size === size) && (!color || item.color === color))
          ),
        }))
      },

      updateQuantity: (id: string, size: string, color: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.size === size && item.color === color
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0),
        }))
      },

      clearCart: () => {
        set({ items: [], coupon: null })
      },

      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      setIsSynced: (v) => set({ isSynced: v }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getItems: () => {
        return get().items
      },

      syncWithDB: async (userId: string) => {
        try {
          const res = await fetch('/api/cart')
          if (!res.ok) return
          const dbItems = await res.json()

          const mapped: CartItem[] = (dbItems || []).map((item: any) => ({
            id: item.product_id || item.products?.id,
            name: item.products?.name || item.product_name || '',
            price: item.products?.price || item.price || 0,
            quantity: item.quantity,
            image: item.products?.image_url || '',
            size: item.size || '',
            color: item.color || '',
            variant_id: item.variant_id || '',
            stock: item.products?.stock,
          }))

          const localItems = get().items
          const merged = [...mapped]

          for (const local of localItems) {
            const exists = merged.find(
              (m) => m.id === local.id && m.size === local.size && m.color === local.color
            )
            if (!exists) {
              try {
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    productId: local.id,
                    quantity: local.quantity,
                    size: local.size,
                    color: local.color,
                    variant_id: local.variant_id,
                  }),
                })
              } catch {}
              merged.push(local)
            }
          }

          set({ items: merged, isSynced: true })
        } catch {
          set({ isSynced: true })
        }
      },

      mergeLocalToDB: async (userId: string) => {
        const items = get().items
        for (const item of items) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: item.id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                variant_id: item.variant_id,
              }),
            })
          } catch {}
        }
      },

      subscribe: (callback: (items: CartItem[]) => void) => {
        const unsubscribe = useCartStore.subscribe(
          (state) => state.items,
          (items) => callback(items)
        )
        return unsubscribe
      },
    }),
    {
      name: '404notfound-cart',
    }
  )
)

export const cartStore = {
  addItem: (item: CartItem) => useCartStore.setState((state) => {
    const existingItem = state.items.find(
      (i) => i.id === item.id && i.size === item.size && i.color === item.color
    )
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      }
    }
    return { items: [...state.items, item] }
  }),

  removeItem: (id: string, size?: string, color?: string) => {
    useCartStore.setState((state) => ({
      items: state.items.filter((item) =>
        !(item.id === id && (!size || item.size === size) && (!color || item.color === color))
      ),
    }))
  },

  updateQuantity: (id: string, size: string, color: string, quantity: number) => {
    useCartStore.setState((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0),
    }))
  },

  clearCart: () => {
    useCartStore.setState({ items: [], coupon: null })
  },

  getItems: () => {
    return useCartStore.getState().items
  },

  getTotalPrice: () => {
    const items = useCartStore.getState().items
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  },

  getTotalItems: () => {
    const items = useCartStore.getState().items
    return items.reduce((total, item) => total + item.quantity, 0)
  },

  subscribe: (callback: (items: CartItem[]) => void) => {
    return useCartStore.subscribe(
      (state) => state.items,
      (items) => callback(items)
    )
  },
}
