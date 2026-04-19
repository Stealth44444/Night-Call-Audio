'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  token: string
  hasReviewed?: boolean
}

type SubmitState = 'idle' | 'submitting' | 'done' | 'error' | 'already'

export default function ReviewForm({ token, hasReviewed = false }: ReviewFormProps) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitState, setSubmitState] = useState<SubmitState>(hasReviewed ? 'already' : 'idle')

  const handleSubmit = async () => {
    if (selected === 0) return
    setSubmitState('submitting')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating: selected }),
      })
      const data = await res.json()

      if (res.ok) {
        setSubmitState('done')
      } else if (data.error === 'already_reviewed') {
        setSubmitState('already')
      } else {
        setSubmitState('error')
      }
    } catch {
      setSubmitState('error')
    }
  }

  if (submitState === 'done') {
    return (
      <div className="mt-6 border-t border-border pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">리뷰</p>
        <p className="text-sm text-accent font-semibold">리뷰가 등록되었습니다. 감사합니다!</p>
      </div>
    )
  }

  if (submitState === 'already') {
    return (
      <div className="mt-6 border-t border-border pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">리뷰</p>
        <p className="text-sm text-text-muted">이미 리뷰를 작성하셨습니다.</p>
      </div>
    )
  }

  const active = hovered || selected

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">이 제품 어떠셨나요?</p>

      {/* 별점 선택 */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`별점 ${i}점`}
          >
            <Star
              size={22}
              className={`transition-colors ${
                i <= active
                  ? 'fill-[#F5A623] stroke-[#D4890A]'
                  : 'fill-transparent stroke-border'
              }`}
              strokeWidth={1.2}
            />
          </button>
        ))}
        {selected > 0 && (
          <span className="ml-2 font-mono text-xs text-text-muted">{selected}.0 / 5</span>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selected === 0 || submitState === 'submitting'}
          className="px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors bg-accent text-bg-deep hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitState === 'submitting' ? '제출 중...' : '리뷰 남기기'}
        </button>
      </div>

      {submitState === 'error' && (
        <p className="mt-2 text-xs text-red-400 font-mono">오류가 발생했습니다. 다시 시도해주세요.</p>
      )}
    </div>
  )
}
