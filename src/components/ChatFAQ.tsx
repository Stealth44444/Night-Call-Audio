'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  id: number
  question: string
  answer: string
}

interface ChatFAQProps {
  faqItems?: FAQItem[]
  timestamp?: string
  showTimestamp?: boolean
  allowMultipleOpen?: boolean
  defaultOpenItem?: number
}

const ChevronDown = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const defaultFAQItems: FAQItem[] = [
  {
    id: 1,
    question: '어떤 결제 수단을 지원하나요?',
    answer:
      'Shopify 결제 시스템을 통해 신용카드, 체크카드, Apple Pay, Google Pay 등 다양한 결제 수단을 지원합니다.',
  },
  {
    id: 2,
    question: '구매 후 다운로드는 어떻게 하나요?',
    answer:
      '결제 완료 후 입력하신 이메일로 다운로드 링크가 자동 발송됩니다. 링크는 1회 다운로드 가능하며, 문제 발생 시 고객센터로 문의해주세요.',
  },
  {
    id: 3,
    question: '프리셋은 어떤 DAW에서 사용 가능한가요?',
    answer:
      '각 프리셋 상품 페이지에 호환 DAW 목록이 명시되어 있습니다. 대부분 FL Studio, Ableton Live, Logic Pro 등 주요 DAW를 지원합니다.',
  },
  {
    id: 4,
    question: '환불 정책은 어떻게 되나요?',
    answer:
      '디지털 상품 특성상 다운로드 완료 후에는 환불이 불가합니다. 다운로드 전이라면 구매 후 24시간 이내 환불 요청이 가능합니다.',
  },
  {
    id: 5,
    question: '플러그인 설치에 도움이 필요해요',
    answer:
      '각 플러그인에는 설치 가이드가 포함되어 있습니다. 추가 도움이 필요하시면 support@nightcallaudio.com으로 문의해주세요.',
  },
]

export default function ChatFAQ({
  faqItems = defaultFAQItems,
  allowMultipleOpen = true,
  defaultOpenItem,
}: ChatFAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(
    new Set(defaultOpenItem !== undefined ? [defaultOpenItem] : [])
  )

  const toggleItem = useCallback(
    (itemId: number) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          if (!allowMultipleOpen) newSet.clear()
          newSet.add(itemId)
        }
        return newSet
      })
    },
    [allowMultipleOpen]
  )

  const answerVariants = {
    open: {
      opacity: 1,
      height: 'auto' as const,
      transition: {
        height: { type: 'spring' as const, stiffness: 260, damping: 26 },
        opacity: { duration: 0.2, delay: 0.05 },
      },
    },
    collapsed: {
      opacity: 0,
      height: 0,
      transition: {
        height: { type: 'spring' as const, stiffness: 260, damping: 26 },
        opacity: { duration: 0.1 },
      },
    },
  }

  return (
    <div style={{ width: '100%' }}>
      {faqItems.map((item, index) => {
        const isOpen = openItems.has(item.id)
        const isLast = index === faqItems.length - 1

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: index * 0.06,
            }}
            style={{
              borderBottom: isLast
                ? 'none'
                : '1px solid var(--border, rgba(255,255,255,0.06))',
            }}
          >
            {/* Question row */}
            <motion.button
              onClick={() => toggleItem(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                padding: '28px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
              }}
              whileTap={{ scale: 0.999 }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: isOpen ? 600 : 500,
                  color: isOpen
                    ? 'var(--text-primary, #EDEDF0)'
                    : 'var(--text-secondary, #9494A8)',
                  lineHeight: 1.5,
                  letterSpacing: '-0.015em',
                  transition: 'color 0.2s',
                }}
              >
                {item.question}
              </span>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  color: isOpen
                    ? 'var(--accent, #D4890A)'
                    : 'var(--text-muted, #55556A)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </motion.button>

            {/* Answer */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={answerVariants}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingBottom: 28 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: 'var(--text-secondary, #9494A8)',
                        lineHeight: 1.8,
                        letterSpacing: '-0.005em',
                        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
