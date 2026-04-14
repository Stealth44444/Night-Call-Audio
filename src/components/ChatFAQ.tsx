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
    question: '구매를 위해 회원가입이 필요한가요?',
    answer:
      '아니요. Night Call Audio는 별도의 회원가입이나 로그인 과정이 필요 없습니다. 결제 시 입력하신 이메일 주소만으로 간편하게 구매하실 수 있으며, 구매 내역은 이메일 인증을 통해 언제든 확인 가능합니다.',
  },
  {
    id: 2,
    question: '결제 방식은 어떻게 되나요?',
    answer:
      '토스페이먼츠(Toss Payments)를 통해 국내외 주요 신용카드, 체크카드, 계좌이체, 그리고 카카오페이, 토스페이 등 다양한 간편결제 수단을 안전하게 지원합니다.',
  },
  {
    id: 3,
    question: '구매한 제품은 어디서 다운로드하나요?',
    answer:
      '상단 메뉴의 [내 구매] 탭을 클릭하신 후, 구매 시 사용한 이메일 주소를 입력해 주세요. 이메일로 발송된 인증 코드를 입력하면 즉시 구매 내역 확인 및 다운로드가 가능합니다.',
  },
  {
    id: 4,
    question: '다운로드 횟수나 기간에 제한이 있나요?',
    answer:
      '보안 및 안정적인 링크 관리를 위해 다운로드 링크는 생성 시점으로부터 7일간 유효합니다. 해당 기간 내에는 횟수 제한 없이 무제한으로 다시 다운로드하실 수 있습니다.',
  },
  {
    id: 5,
    question: '환불이나 교환이 가능한가요?',
    answer:
      '디지털 다운로드 상품의 특성상, 결제가 완료되고 다운로드 링크가 노출된 시점부터는 어떠한 사유로도 환불 및 교환이 불가능합니다. 구매 전 상품 상세 페이지와 미리 듣기 샘플을 충분히 확인해 주시기 바랍니다.',
  },
  {
    id: 6,
    question: '상업적 이용(라이선스) 조건은 어떻게 되나요?',
    answer:
      'NCA의 모든 프리셋과 샘플은 100% 로열티 프리(Royalty-Free)입니다. 구매 후 음원 발매, 공연, 영상 배경음악 등 모든 상업적 활동에 자유롭게 사용하실 수 있습니다. 단, 파일 자체를 타인에게 재배포하거나 다시 판매하는 행위는 엄격히 금지됩니다.',
  },
  {
    id: 7,
    question: '다운로드 링크가 만료되었는데 다시 받아야 해요.',
    answer:
      '7일이 지난 후 재설치 등의 사유로 재다운로드가 필요하신 경우, 주문 상세 정보와 이메일 주소를 support@nightcallaudio.com으로 보내주시면 본인 확인 후 링크를 갱신해 드립니다.',
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
