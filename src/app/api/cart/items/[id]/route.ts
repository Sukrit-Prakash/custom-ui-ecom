// app/api/cart/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const itemId = parseInt(params.id, 10)

  try {
    await prisma.cartItem.delete({
      where: { id: itemId },
    })
    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('[DELETE /api/cart/items]', error)
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 })
  }
}
