import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type CartItem = { id: string; quantity: number }

type ShopContextValue = {
  cart: CartItem[]
  cartCount: number
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  favorites: string[]
  favoritesCount: number
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

const CART_KEY = 'od-complaints-cart'
const FAVORITES_KEY = 'od-complaints-favorites'

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readCart())
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites())

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const addToCart = (id: string) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === id)
      if (existing) {
        return current.map((entry) => (entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry))
      }
      return [...current, { id, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((entry) => entry.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((current) => current.map((entry) => (entry.id === id ? { ...entry, quantity } : entry)))
  }

  const toggleFavorite = (id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]))
  }

  const isFavorite = (id: string) => favorites.includes(id)

  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0)

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        favoritesCount: favorites.length,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}
