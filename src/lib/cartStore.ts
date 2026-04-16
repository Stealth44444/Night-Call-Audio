import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  image_url?: string | null
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clear: () => void
  total: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => set(state => {
        const exists = state.items.some(i => i.productId === item.productId)
        if (exists) return state
        return { items: [...state.items, item] }
      }),

      removeItem: (productId: string) => set(state => ({
        items: state.items.filter(i => i.productId !== productId)
      })),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, item) => sum + item.price, 0)
    }),
    { name: 'cart' }
  )
)
