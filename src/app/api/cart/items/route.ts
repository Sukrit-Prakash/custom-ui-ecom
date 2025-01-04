// app/api/cart/items/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { productId, quantity } = await req.json()
  const customerId = 124 // Replace with actual customer ID from session

  try {
    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerId: customerId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: customerId },
      })
    }

    // Check if CartItem exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
      return NextResponse.json(updatedItem)
    } else {
      // Create new CartItem
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      })
      return NextResponse.json(newItem)
    }
  } catch (error) {
    console.error('[POST /api/cart/items]', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
