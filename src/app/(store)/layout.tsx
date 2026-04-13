import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
