// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/** GET /api/categories/[id] */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10)

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { products: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('[GET category by ID]', error)
    return NextResponse.json({ error: 'Error fetching category' }, { status: 500 })
  }
}

/** PATCH (or PUT) /api/categories/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const categoryId = parseInt(params.id, 10)

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        // Optionally connect/disconnect products if desired:
        // products: {
        //   connect: body.connectProductIds?.map((id: number) => ({ id })),
        //   disconnect: body.disconnectProductIds?.map((id: number) => ({ id })),
        // },
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('[PATCH category]', error)
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 })
  }
}

/** DELETE /api/categories/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10)

    await prisma.category.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('[DELETE category]', error)
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 })
  }
}
