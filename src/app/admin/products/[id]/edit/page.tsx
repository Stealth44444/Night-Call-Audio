import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-3xl text-text-primary">Edit: {product.name}</h1>
      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description ?? '',
          price: String(product.price),
          category: product.category ?? 'plugin',
          shopify_variant_id: product.shopify_variant_id ?? '',
          file_path: product.file_path ?? '',
          image_url: product.image_url ?? '',
        }}
      />
    </div>
  )
}
