import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getPodProduct } from '../data/printOnDemand'
import { getClaimableWork, workIdFromCartId } from '../data/claims'
import { cartKey, maxCartQuantity } from '../lib/cart'
import { fetchClaimStatus, getClaimState } from '../lib/claims'
import type { ClaimStatus } from '../lib/claims'
import { fetchSoldOutIds } from '../lib/soldOut'

/** `size` is only set for Print-on-Demand items, which are ordered per size. */
export type CartItem = { id: string; quantity: number; size?: string }

type ShopContextValue = {
  cart: CartItem[]
  cartCount: number
  addToCart: (id: string, size?: string) => void
  /** Takes a line key from `cartKey()`. */
  removeFromCart: (key: string) => void
  /** Takes a line key from `cartKey()`. */
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  favorites: string[]
  favoritesCount: number
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  /** True if this product was auto-marked sold-out by a real purchase (live, not from shop.ts). Also covers claimed templates. */
  isSoldOut: (id: string) => boolean
  /** Live claim state of the tattoo templates (see api/claim-status.ts). */
  claimStatus: ClaimStatus
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
  const [soldOutIds, setSoldOutIds] = useState<string[]>([])
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>({ claimed: [], reserved: [] })

  useEffect(() => {
    let cancelled = false
    fetchSoldOutIds().then((ids) => {
      if (!cancelled) setSoldOutIds(ids)
    })
    fetchClaimStatus().then((status) => {
      if (!cancelled) setClaimStatus(status)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isSoldOut = (id: string) => {
    const workId = workIdFromCartId(id)
    if (workId !== null) {
      const piece = getClaimableWork(workId)
      return !piece || getClaimState(piece, claimStatus) === 'claimed'
    }
    return soldOutIds.includes(id)
  }

  const addToCart = (id: string, size?: string) => {
    if (isSoldOut(id)) return
    // POD items always need a valid size, regular items never carry one.
    const pod = getPodProduct(id)
    if (pod ? !size || !pod.sizes.includes(size) : size) return
    const key = cartKey({ id, size })
    const maxStock = maxCartQuantity(id)
    setCart((current) => {
      const existing = current.find((entry) => cartKey(entry) === key)
      if (existing) {
        if (existing.quantity >= maxStock) return current
        return current.map((entry) => (cartKey(entry) === key ? { ...entry, quantity: entry.quantity + 1 } : entry))
      }
      return [...current, size ? { id, quantity: 1, size } : { id, quantity: 1 }]
    })
  }

  const removeFromCart = (key: string) => {
    setCart((current) => current.filter((entry) => cartKey(entry) !== key))
  }

  const clearCart = () => {
    setCart([])
  }

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key)
      return
    }
    setCart((current) =>
      current.map((entry) =>
        cartKey(entry) === key ? { ...entry, quantity: Math.min(quantity, maxCartQuantity(entry.id)) } : entry,
      ),
    )
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
        isSoldOut,
        claimStatus,
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
