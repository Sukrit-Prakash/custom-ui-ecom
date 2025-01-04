// app/api/products/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  try {
    const res = await fetch(`https://api.slingacademy.com/v1/sample-data/photos?offset=${offset}&limit=${limit}`)
    if (!res.ok) {
      throw new Error('Failed to fetch photos')
    }

    const data = await res.json()
    const photos = data.photos

    const products = photos.map((photo: any) => ({
      id: photo.id,
      name: photo.title,
      description: 'A beautiful custom wrapper for your phone.',
      price: (Math.random() * 100 + 20).toFixed(2), // Random price between $20 and $120
      image: photo.url,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('[GET /api/products]', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
