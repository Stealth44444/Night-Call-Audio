'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${productName}" 을(를) 삭제하시겠습니까?`)) return

    setDeleting(true)
    try {
      await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      alert('삭제 실패')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition disabled:opacity-50"
    >
      {deleting ? '...' : 'Delete'}
    </button>
  )
}
