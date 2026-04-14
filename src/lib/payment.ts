// ====================================================
// 토스페이먼츠 연동 준비 파일
// ====================================================
// 연동 시 필요한 환경변수 (.env.local에 추가):
//   NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
//   TOSS_SECRET_KEY=test_sk_...
//
// 연동 순서:
//   1. 토스페이먼츠 가입 후 키 발급
//   2. 환경변수 추가
//   3. cart/page.tsx의 TODO 주석 활성화
//   4. api/checkout/confirm/route.ts의 TODO 주석 활성화
// ====================================================

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ''
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? ''

export const isPaymentConfigured = () =>
  !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && !!process.env.TOSS_SECRET_KEY

export const PAYMENT_SUCCESS_PATH = '/order-complete'
export const PAYMENT_FAIL_PATH = '/cart'
