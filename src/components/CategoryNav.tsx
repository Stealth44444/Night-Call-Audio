'use client'

import Link from 'next/link'

const CATEGORIES = [
  { key: 'all',        label: '전체' },
  { key: 'vocal',      label: '보컬 프리셋' },
  { key: 'plugin',     label: '믹싱 플러그인' },
  { key: 'instrument', label: '가상 악기' },
  { key: 'mastering',  label: '마스터링' },
  { key: 'sample',     label: '샘플 팩' },
  { key: 'bundle',     label: '번들' },
]

export default function CategoryNav({ active }: { active: string }) {
  return (
    <div className="sticky top-16 z-40 bg-bg-deep/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              href={cat.key === 'all' ? '/#sections' : `/?cat=${cat.key}#sections`}
              scroll={false}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all rounded-full shrink-0 ${
                active === cat.key
                  ? 'bg-accent text-bg-deep'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
