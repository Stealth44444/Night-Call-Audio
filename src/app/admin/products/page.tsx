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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-1">등록된 오디오 솔루션</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all btn-glow text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">새 제품 등록</span>
          <span className="sm:hidden">등록</span>
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="flex flex-col items-center py-20 gap-4 glass rounded-2xl border border-border">
          <Package size={40} className="text-text-muted/20" />
          <p className="text-sm text-text-muted">등록된 제품이 없습니다.</p>
          <Link href="/admin/products/new" className="text-accent hover:text-accent-bright text-sm font-bold border-b border-accent/30 hover:border-accent transition-colors">
            첫 제품 등록하기
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block glass rounded-2xl overflow-hidden border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated/50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">File</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(product => (
                  <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-deep border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getPublicUrl(product.image_url) || ''} alt="" className="w-full h-full object-cover" />
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
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <DeleteButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {products.map(product => (
              <div key={product.id} className="glass rounded-2xl border border-border overflow-hidden">
                <div className="flex items-stretch">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 bg-bg-deep border-r border-border flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPublicUrl(product.image_url) || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-text-muted" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 px-4 py-3">
                    <p className="font-display font-bold text-text-primary truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-display font-bold text-accent-bright text-sm">
                        ₩{Number(product.price).toLocaleString('ko-KR')}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-bg-elevated border border-border text-text-secondary">
                        {product.category}
                      </span>
                      {product.file_path ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-green-500/10 border border-green-500/20 text-green-500">
                          <div className="w-1 h-1 rounded-full bg-green-500" />
                          파일 있음
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                          <div className="w-1 h-1 rounded-full bg-red-500" />
                          파일 없음
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center justify-center gap-1 px-3 border-l border-border shrink-0">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </Link>
                    <DeleteButton productId={product.id} productName={product.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
