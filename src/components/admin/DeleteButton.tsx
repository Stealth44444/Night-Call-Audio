'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

export default function DeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      // item stays — router.refresh will show current state
    } finally {
      setDeleting(false)
      setConfirm(false)
    }
  }

  if (deleting) {
    return <Loader2 size={15} className="animate-spin text-text-muted" />
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all whitespace-nowrap"
          title={`"${productName}" 삭제`}
        >
          삭제
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-all"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
      title="삭제"
    >
      <Trash2 size={15} />
    </button>
  )
}
