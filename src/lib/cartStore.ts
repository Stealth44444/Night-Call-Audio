import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image_url?: string | null
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => set(state => {
        const existing = state.items.find(i => i.productId === item.productId)
        const updated = existing
          ? state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          : [...state.items, item]
        return { items: updated }
      }),

      removeItem: (productId: string) => set(state => ({
        items: state.items.filter(i => i.productId !== productId)
      })),

      updateQuantity: (productId: string, quantity: number) => set(state => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        )
      })),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }),
    { name: 'cart' }
  )
)
