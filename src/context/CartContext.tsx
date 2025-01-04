// context/CartContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Product = {
  id: number
  name: string
  description: string
  price: string
  image: string
}

type CartItem = {
  id: number
  productId: number
  quantity: number
  product: Product
}

type CartContextType = {
  items: CartItem[]
  addToCart: (productId: number, quantity?: number) => void
  removeFromCart: (itemId: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      if (res.ok) {
        const newItem = await res.json()
        setItems((prev) => {
          const existing = prev.find(item => item.productId === productId)
          if (existing) {
            return prev.map(item => 
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
            )
          } else {
            return [...prev, { ...newItem, product: { ...newItem.product } }]
          }
        })
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    }
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
