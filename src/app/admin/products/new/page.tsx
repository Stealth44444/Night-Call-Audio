import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-3xl text-text-primary">New Product</h1>
      <ProductForm mode="create" />
    </div>
  )
}
