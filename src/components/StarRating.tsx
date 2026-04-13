'use client'

import { useId } from 'react'

interface StarRatingProps {
  rating?: number
  size?: 'sm' | 'md'
  showCount?: boolean
  count?: number
}

function StarIcon({ pct, size, baseId, index }: { pct: number; size: 'sm' | 'md'; baseId: string; index: number }) {
  const uid = `${baseId}-star-${index}`
  const dim = size === 'sm' ? 13 : 17

  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={uid} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset={`${pct}%`} stopColor="#F5A623" />
          <stop offset={`${pct}%`} stopColor="rgba(245,166,35,0.10)" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={`url(#${uid})`}
        stroke={pct > 0 ? '#D4890A' : 'rgba(212,137,10,0.2)'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StarRating({
  rating = 4.9,
  size = 'sm',
  showCount = false,
  count,
}: StarRatingProps) {
  const baseId = useId().replace(/:/g, '')

  const stars = [1, 2, 3, 4, 5].map(i => {
    const diff = rating - (i - 1)
    if (diff >= 1) return 100
    if (diff <= 0) return 0
    return Math.round(diff * 100)
  })

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((pct, i) => (
          <StarIcon key={i} pct={pct} size={size} baseId={baseId} index={i} />
        ))}
      </div>
      <span
        className={`font-mono font-semibold tabular-nums text-accent-bright leading-none ${
          size === 'sm' ? 'text-[11px]' : 'text-sm'
        }`}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={`text-text-muted ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}
