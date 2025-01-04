// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const customerId = 124 // Replace with actual customer ID from session

  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId: customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('[GET /api/cart]', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
