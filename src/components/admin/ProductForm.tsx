'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, Info, Link as LinkIcon, FileText, CheckCircle2, Plus } from 'lucide-react'

interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  shopify_variant_id: string
  file_path: string
  image_url: string
}

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string }
  mode: 'create' | 'edit'
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    category: initialData?.category ?? 'plugin',
    shopify_variant_id: initialData?.shopify_variant_id ?? '',
    file_path: initialData?.file_path ?? '',
    image_url: initialData?.image_url ?? '',
  })

  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'products')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setForm(prev => ({ ...prev, file_path: data.path }))
      setUploadedFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'products')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      // Construct a full URL if it's external or just the path for our lib to resolve
      // Assuming our storage utility gives us the public URL eventually
      setForm(prev => ({ ...prev, image_url: data.path }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드 실패')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = mode === 'create'
        ? '/api/admin/products'
        : `/api/admin/products/${initialData?.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-4xl">
      {error && (
        <div className="bg-nca-pink/10 border border-nca-pink/20 text-nca-pink px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="glass rounded-3xl p-8 space-y-6 border border-border">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 text-text-primary">
              <FileText size={18} className="text-accent" /> 기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 ml-1">상품명</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="예: Artist Vocal Preset Vol.1"
                  className="w-full px-4 py-3 bg-bg-deep border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-text-primary placeholder:text-text-muted/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 ml-1">상품 설명</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="제품에 대한 상세 설명을 입력하세요..."
                  className="w-full px-4 py-3 bg-bg-deep border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-text-primary resize-none placeholder:text-text-muted/30"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Category */}
          <div className="glass rounded-3xl p-8 border border-border overflow-hidden">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 ml-1">가격 (KRW)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="69000"
                    className="w-full pl-8 pr-4 py-3 bg-bg-deep border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-text-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 ml-1">카테고리</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-deep border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition text-text-primary appearance-none cursor-pointer"
                >
                  <option value="plugin">플러그인</option>
                  <option value="preset">프리셋</option>
                  <option value="sample">샘플 팩</option>
                  <option value="bundle">번들</option>
                  <option value="service">서비스</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image Upload Card */}
          <div className="glass rounded-3xl p-6 border border-border">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-text-primary">
              <Plus size={18} className="text-accent" /> 상품 이미지
            </h2>
            
            <div 
              className={`relative rounded-2xl aspect-square bg-bg-deep border-border overflow-hidden group cursor-pointer transition-all ${
                uploadingImage ? 'opacity-50' : ''
              }`}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {form.image_url ? (
                <>
                  <img 
                    src={form.image_url.startsWith('http') ? form.image_url : `/api/products/image?path=${form.image_url}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-white text-center">이미지 변경</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 gap-2 text-text-muted hover:text-text-primary transition-colors">
                  <Plus size={24} />
                  <p className="text-xs font-medium">이미지 추가</p>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-[10px] text-text-muted mt-3 text-center">고품질 정방형(1:1) 이미지를 권장합니다.</p>
          </div>

          {/* File Upload Sidebar Card */}
          <div className="glass rounded-3xl p-6 border border-border">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-text-primary">
              <Upload size={18} className="text-accent" /> 디지털 파일
            </h2>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                uploadingFile
                  ? 'border-accent/50 bg-accent/5 cursor-wait'
                  : form.file_path
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border hover:border-accent/40 hover:bg-white/[0.02]'
              }`}
            >
              {uploadingFile ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-accent uppercase tracking-tighter">Uploading...</p>
                </div>
              ) : form.file_path ? (
                <div className="space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-emerald-400 uppercase">Ready</p>
                  <p className="text-[10px] text-text-muted truncate mt-1 px-2">{uploadedFileName || 'File selected'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="text-text-muted group-hover:text-accent transition-colors mx-auto" />
                  <p className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">클릭하여 업로드</p>
                  <p className="text-[10px] text-text-muted">.zip, .pkg 등 모든 포맷</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Shopify Sidebar Card */}
          <div className="glass rounded-3xl p-6 border border-border">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-text-primary">
              <LinkIcon size={18} className="text-accent" /> 쇼피파이 연동
            </h2>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">버전 ID</label>
              <input
                name="shopify_variant_id"
                value={form.shopify_variant_id}
                onChange={handleChange}
                placeholder="gid://shopify/ProductVariant/..."
                className="w-full px-3 py-2 bg-black/40 border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-[10px] font-mono text-text-primary transition"
              />
              <p className="text-[10px] text-text-muted leading-relaxed italic opacity-60">
                Shopify 관리자에서 생성한 Variant의 GraphQL ID를 입력하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving || uploadingFile || uploadingImage}
          className="flex-1 md:flex-none px-8 py-3.5 bg-accent text-bg-deep font-display font-bold rounded-2xl hover:bg-accent-bright transition-all btn-glow text-sm disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-deep border-t-transparent rounded-full animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              <Save size={18} />
              {mode === 'create' ? '상품 생성' : '변경사항 저장'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-8 py-3.5 border border-border rounded-2xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all flex items-center gap-2"
        >
          <X size={18} /> 취소
        </button>
      </div>
    </form>
  )
}
