// components/ProductCard.tsx
import React from 'react'

type Product = {
  id: number
  name: string
  description: string
  price: string
  image: string
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold">${product.price}</span>
          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
