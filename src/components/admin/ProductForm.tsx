'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, Info, FileText, CheckCircle2, Plus, FolderOpen, File as FileIcon, Trash2 } from 'lucide-react'

interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
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
  const folderInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    category: initialData?.category ?? 'plugin',
    file_path: initialData?.file_path ?? '',
    image_url: initialData?.image_url ?? '',
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? [])
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => (f as File & { webkitRelativePath: string }).webkitRelativePath || f.name))
      const deduped = incoming.filter(f => !existingNames.has((f as File & { webkitRelativePath: string }).webkitRelativePath || f.name))
      return [...prev, ...deduped]
    })
    e.target.value = ''
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return
    setUploadingFile(true)
    setError('')

    try {
      let fileToUpload: File
      let displayName: string

      if (selectedFiles.length === 1 && !(selectedFiles[0] as File & { webkitRelativePath: string }).webkitRelativePath) {
        // 단일 파일: 그대로 업로드
        fileToUpload = selectedFiles[0]
        displayName = selectedFiles[0].name
      } else {
        // 다중 파일/폴더: ZIP으로 묶어서 업로드
        setUploadProgress('ZIP으로 묶는 중...')
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        for (const file of selectedFiles) {
          const path = (file as File & { webkitRelativePath: string }).webkitRelativePath || file.name
          zip.file(path, file)
        }

        setUploadProgress('압축 중...')
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
        const zipName = (form.name.trim() || 'bundle').replace(/[^a-zA-Z0-9가-힣]/g, '-') + '.zip'
        fileToUpload = new File([blob], zipName, { type: 'application/zip' })
        displayName = zipName
      }

      setUploadProgress('업로드 중...')
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('bucket', 'products')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setForm(prev => ({ ...prev, file_path: data.path }))
      setUploadedFileName(displayName)
      setSelectedFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploadingFile(false)
      setUploadProgress('')
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

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0)
  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">₩</span>
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
                  <option value="instrument">가상 악기</option>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

          {/* File Upload Card */}
          <div className="glass rounded-3xl p-6 border border-border space-y-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 text-text-primary">
              <Upload size={18} className="text-accent" /> 디지털 파일
            </h2>

            {/* Uploaded success state */}
            {form.file_path && selectedFiles.length === 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">업로드 완료</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{uploadedFileName || form.file_path}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setForm(prev => ({ ...prev, file_path: '' })); setUploadedFileName('') }}
                  className="ml-auto text-text-muted hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, i) => {
                  const relativePath = (file as File & { webkitRelativePath: string }).webkitRelativePath || file.name
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-deep border border-border/50 group">
                      <FileIcon size={12} className="text-text-muted shrink-0" />
                      <span className="text-[10px] text-text-secondary truncate flex-1 font-mono">{relativePath}</span>
                      <span className="text-[9px] text-text-muted shrink-0">{fmtSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(i)}
                        className="text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
                <div className="flex justify-between items-center px-3 pt-1">
                  <span className="text-[9px] text-text-muted">{selectedFiles.length}개 파일 · {fmtSize(totalSize)}</span>
                  {selectedFiles.length > 1 && (
                    <span className="text-[9px] text-accent">ZIP으로 묶어 업로드됩니다</span>
                  )}
                </div>
              </div>
            )}

            {/* Add buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-bg-deep/60 text-[11px] font-bold text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
              >
                <Plus size={13} /> 파일 추가
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-bg-deep/60 text-[11px] font-bold text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
              >
                <FolderOpen size={13} /> 폴더 추가
              </button>
            </div>

            {/* Upload button */}
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleUploadFiles}
                disabled={uploadingFile}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-bg-deep font-bold text-xs tracking-wider uppercase hover:bg-accent-bright transition-colors disabled:opacity-50"
              >
                {uploadingFile ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-bg-deep border-t-transparent rounded-full animate-spin" />
                    {uploadProgress || '처리 중...'}
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    {selectedFiles.length > 1 ? `${selectedFiles.length}개 파일 ZIP 업로드` : '파일 업로드'}
                  </>
                )}
              </button>
            )}

            {/* Empty state hint */}
            {selectedFiles.length === 0 && !form.file_path && (
              <p className="text-[10px] text-text-muted text-center">파일 또는 폴더를 추가한 뒤 업로드하세요.<br/>여러 파일은 자동으로 ZIP으로 묶입니다.</p>
            )}

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is non-standard
              webkitdirectory=""
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
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
