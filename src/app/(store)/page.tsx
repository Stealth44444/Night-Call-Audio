import { getProducts } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import FloatingAnimation from '@/components/FloatingAnimation'
import ChatFAQ from '@/components/ChatFAQ'
import DAWMarquee from '@/components/DAWMarquee'
import Link from 'next/link'
import { getPublicUrl } from '@/lib/storage'
import ProductCarousel from '@/components/ProductCarousel'

export const revalidate = 60

export default async function HomePage() {
  const allProducts = await getProducts()

  const setupProduct = allProducts.find(p => p.name.includes('올인원 원격 세팅'))

  const sections = [
    { title: 'Artist Vocal Presets', koTitle: '아티스트 보컬 프리셋', filter: (p: any) => p.category === 'preset' && p.name.toLowerCase().includes('vocal') },
    { title: 'Professional Mixing Plugins', koTitle: '프로페셔널 믹싱 플러그인', filter: (p: any) => p.category === 'plugin' },
    { title: 'Virtual Instruments', koTitle: '가상 악기 컬렉션', filter: (p: any) => p.category === 'instrument' },
    { title: 'Mastering Presets', koTitle: '마스터링 프리셋', filter: (p: any) => p.category === 'preset' && !p.name.toLowerCase().includes('vocal') },
    { title: 'Sample Packs', koTitle: '샘플 팩', filter: (p: any) => p.category === 'sample' },
    { title: 'Bundle & Save', koTitle: '번들 및 할인 세트', filter: (p: any) => p.category === 'bundle' },
  ]

  return (
    <>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <FloatingAnimation
          colorStops={['#764105', '#1818E7', '#FF299B']}
          amplitude={1}
          blend={0.5}
          speed={1}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg-deep)_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight animate-fade-in-up stagger-1">
            Craft Your{' '}
            <span className="bg-gradient-to-r from-accent-bright via-accent to-nca-pink bg-clip-text text-transparent">
              Sound
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            Night Call Audio 온라인 플래그십 스토어
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Link
              href="#sections"
              className="btn-glow relative z-10 px-8 py-3.5 bg-accent text-bg-deep font-bold rounded-full hover:bg-accent-bright transition-colors text-sm"
            >
              제품 둘러보기
            </Link>
            <Link
              href="#sections"
              className="px-8 py-3.5 border border-border rounded-full text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
            >
              커뮤니티 가기
            </Link>
          </div>
        </div>
      </section>

      {/* COMPATIBLE DAWs */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-bg-deep/0 to-bg-deep">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Compatibility</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-2">
            Compatible With All DAWs
          </h2>
        </div>
        <DAWMarquee />
      </section>


      {/* PRODUCT SECTIONS */}
      <div id="sections" className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-20 py-12 space-y-24">
        {sections.map((section, idx) => {
          const filteredProducts = allProducts.filter(section.filter)

          return (
            <section key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-end justify-between mb-8 border-b border-border pb-6 pr-24">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">Collection</span>
                  <h2 className="font-display font-bold text-2xl md:text-3xl mt-1.5">{section.title}</h2>
                  <p className="text-sm text-text-muted mt-1 font-medium">{section.koTitle}</p>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <ProductCarousel products={filteredProducts} />
              ) : (
                <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-bg-surface/30">
                  <p className="text-sm text-text-muted italic">Soon Available — 준비 중인 컬렉션입니다.</p>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* REMOTE SETUP SERVICE */}
      {setupProduct && (
        <section className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-20 py-20">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Service</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-2">올인원 원격 세팅</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-6">
            {/* 텍스트 */}
            <div className="md:col-span-2">
              <p className="text-sm text-text-secondary leading-relaxed">
                세팅의 복잡함을 제거하고, 최상의 음질만 누리세요.
              </p>
            </div>

            {/* 이미지 - 데스크톱에서 우측 고정 */}
            <div className="relative h-64 rounded-lg overflow-hidden md:col-start-3 md:row-start-1 md:row-span-3">
              {setupProduct?.image_url ? (
                <img
                  src={getPublicUrl(setupProduct.image_url) || ''}
                  alt="Remote Setup Service"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-text-muted text-xs">상품 이미지</p>
                </div>
              )}
            </div>

            {/* Who This Is For */}
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Who This Is For</p>
              <div className="space-y-3">
                {[
                  '플러그인 설치와 경로 설정이 어렵게 느껴지는 입문 프로듀서',
                  '내 목소리에 딱 맞는 보컬 체인 설정을 전문가에게 맡기고 싶은 아티스트',
                  '기술적인 문제 해결보다 창작과 영감에 더 많은 시간을 쓰고 싶은 분'
                ].map((text, i) => (
                  <div key={i} className="flex items-start">
                    <span className="text-xs text-text-secondary leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="md:col-span-2">
              <Link
                href={setupProduct ? `/products/${setupProduct.id}` : '#'}
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2.5 md:px-10 md:py-4 bg-accent text-bg-deep font-display font-black rounded-full hover:bg-accent-bright transition-all duration-300 btn-glow text-sm md:text-base tracking-tight whitespace-nowrap"
              >
                {setupProduct ? `₩${setupProduct.price.toLocaleString('ko-KR')} 예약` : '예약하기'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-20 py-24">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Support</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mt-2 tracking-tight">FAQ</h2>
          <p className="text-sm text-text-muted mt-2">궁금한 점이 있으시면 확인해보세요</p>
        </div>
        <ChatFAQ />
      </section>

    </>
  )
}
