import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import DeleteButton from '@/components/admin/DeleteButton'
import { Plus, Edit2, ShoppingBag, Package } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary text-shadow-sm">Products</h1>
          <p className="text-sm text-text-secondary mt-1">등록된 모든 오디오 솔루션 리스트</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all btn-glow text-sm"
        >
          <Plus size={18} /> 새 제품 등록
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-elevated/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">File Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map(product => (
              <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bg-deep border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={getPublicUrl(product.image_url) || ''} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag size={16} className="text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-text-primary group-hover:text-accent transition-colors truncate">{product.name}</p>
                      <p className="text-xs text-text-muted truncate max-w-xs mt-0.5">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-lg font-display font-black text-accent-bright tracking-tight">
                    ₩{Number(product.price).toLocaleString('ko-KR')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {product.file_path ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Missing
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <DeleteButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}

            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Package size={48} className="text-text-muted/20" />
                    <p className="text-sm text-text-muted italic">No products found in the collection.</p>
                    <Link href="/admin/products/new" className="text-accent hover:text-accent-bright text-sm font-bold border-b border-accent/30 hover:border-accent">
                      Create your first product
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
