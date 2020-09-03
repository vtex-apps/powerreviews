declare module 'vtex.product-context' {
  import { Context } from 'react'

  export interface IProductContext {
    product: Product
    selectedItem: Sku
  }

  interface Product {
    productId: string
    productName: string
    description: string
    categories: string[]
    brand: string
    productReference: string
    ean: string
    linkText: string
    items: Sku[]
  }

  interface Sku {
    name: string
    image: Image[]
    ean: string
    sellers: Seller[]
  }

  interface Seller {
    commertialOffer?: {
      AvailableQuantity: number
      Price?: number
    }
  }

  interface Image {
    imageUrl: string
  }

  export const ProductContext = ProductContext
}
