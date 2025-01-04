// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/** GET: List all categories */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true, // or false if you only want category data
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('[GET categories]', error)
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
  }
}

/** POST: Create a new category */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        // If you want to connect existing products:
        // products: { connect: [{ id: someProductId }, ...] }
      },
    })

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('[POST categories]', error)
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 })
  }
}
