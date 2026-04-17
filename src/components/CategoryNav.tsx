'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

const CATEGORIES = [
  { key: 'all',        label: '전체' },
  { key: 'vocal',      label: '보컬 프리셋' },
  { key: 'plugin',     label: '믹싱 플러그인' },
  { key: 'instrument', label: '가상 악기' },
  { key: 'bundle',     label: '번들' },
]

export default function CategoryNav({ active }: { active: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fadeLeft, setFadeLeft] = useState(false)
  const [fadeRight, setFadeRight] = useState(false)

  const updateFade = () => {
    const el = scrollRef.current
    if (!el) return
    setFadeLeft(el.scrollLeft > 8)
    setFadeRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateFade()
    el.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      el.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [])

  // 활성 탭으로 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement
    if (!activeEl) return
    const offset = activeEl.offsetLeft - el.clientWidth / 2 + activeEl.offsetWidth / 2
    el.scrollTo({ left: offset, behavior: 'smooth' })
  }, [active])

  return (
    <div className="sticky top-16 z-40 bg-bg-deep/90 backdrop-blur-md border-b border-border">
      <div className="relative max-w-[1600px] mx-auto">
        {/* 왼쪽 페이드 */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to right, rgba(6,6,6,0.9), transparent)',
            opacity: fadeLeft ? 1 : 0,
          }}
        />
        {/* 오른쪽 페이드 */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to left, rgba(6,6,6,0.9), transparent)',
            opacity: fadeRight ? 1 : 0,
          }}
        />

        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto py-3 px-4 sm:px-12 md:px-16 lg:px-20 md:justify-center
                     scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              data-active={active === cat.key ? 'true' : 'false'}
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
