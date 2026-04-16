import { getProductById } from '@/lib/products'
import ProductDetail from '@/components/ProductDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) return {}

  return {
    title: `${product.name} — Night Call Audio`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} — Night Call Audio`,
      description: product.description.slice(0, 160),
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  }
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
