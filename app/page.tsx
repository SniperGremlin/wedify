import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F1E8' }}>

      {/* ── NAV ─────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-10 h-16 flex items-center justify-between">
        <span className={`${playfair.className} text-xl`} style={{ color: 'var(--primary)' }}>Wedify</span>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm font-medium" style={{ color: '#7a5438' }}>
            Log in
          </Link>
          <Link href="/login">
            <Button size="sm" className="text-sm px-5 h-8 rounded-full text-white"
              style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh' }}>

        {/* Paper texture */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/paper-texture.png" alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.05, mixBlendMode: 'multiply' }} />

        {/* ── 3-column balanced layout ── */}
        <div className="relative w-full flex items-center justify-center"
          style={{ maxWidth: '1140px', padding: '0 48px', gap: '40px' }}>

          {/* LEFT: Botanical backdrop + Polaroid */}
          <div className="hidden lg:flex items-center justify-center relative flex-shrink-0"
            style={{ width: '250px' }}>

            {/* Soft atmospheric botanical behind polaroid */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/botanical-design.png" alt="" aria-hidden
              className="absolute pointer-events-none select-none"
              style={{
                width: '360px',
                opacity: 0.18,
                mixBlendMode: 'multiply',
                transform: 'translate(-50px, 10px)',
              }}
            />

            {/* Polaroid photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/polaroid-laugh.png" alt=""
              className="relative pointer-events-none select-none"
              style={{
                width: '205px',
                transform: 'rotate(-5deg)',
                filter: 'drop-shadow(0 8px 28px rgba(60,28,8,0.22))',
              }}
            />
          </div>

          {/* CENTER: Hero content */}
          <div className="flex flex-col items-center text-center"
            style={{ flex: '1 1 0', minWidth: 0, maxWidth: '460px' }}>

            {/* Pill */}
            <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-6 border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.65)',
                borderColor: 'rgba(201,149,108,0.28)',
                color: '#8a6448',
              }}>
              <Heart className="w-2.5 h-2.5 shrink-0" fill="currentColor" style={{ color: 'var(--primary)' }} />
              A new kind of wedding experience
            </div>

            {/* Headline */}
            <h1 className={`${playfair.className} font-bold mb-5`}
              style={{
                fontSize: 'clamp(2.1rem, 3.6vw, 3.3rem)',
                lineHeight: 1.13,
                color: '#1a0e06',
                letterSpacing: '-0.01em',
              }}>
              Your wedding,<br />co-created<br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>by the people<br />you love</em>
            </h1>

            {/* Body */}
            <p className="leading-relaxed mb-8"
              style={{ fontSize: '14.5px', color: '#7a5438', maxWidth: '340px' }}>
              Bring your favourite people together to contribute their skills, time and ideas.
              Wedify helps you co-create a wedding that&apos;s meaningful, personal, and truly unforgettable.
            </p>

            {/* CTA */}
            <Link href="/login">
              <Button size="lg" className="text-white px-10 h-11 text-sm"
                style={{
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(180,110,60,0.28)',
                }}>
                Start planning for free →
              </Button>
            </Link>

          </div>

          {/* RIGHT: Flowers quote card */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0"
            style={{ width: '250px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/flowers.png" alt=""
              className="pointer-events-none select-none"
              style={{
                width: '235px',
                transform: 'rotate(3deg)',
                filter: 'drop-shadow(0 5px 18px rgba(60,28,8,0.13))',
              }}
            />
          </div>

        </div>

      </section>

      {/* ── FOOTER ─────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center text-xs z-10"
        style={{ color: 'rgba(160,110,70,0.45)' }}>
        © 2026 Wedify
      </footer>

    </div>
  )
}
