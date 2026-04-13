import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4 group transition-all">
              <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-500 ease-out">
                <Image 
                  src="/nca_logo.svg" 
                  alt="Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tighter text-text-primary group-hover:text-accent transition-colors">
                Night Call Audio
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Night Call Audio 온라인 플래그십 스토어
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">스토어</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">모든 제품</Link>
              <Link href="/cart" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cart</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">고객 지원</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-text-secondary">stealth12345789@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center">
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Night Call Audio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
