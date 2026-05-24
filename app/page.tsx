import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf4ed' }}>

      {/* ── NAV ─────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-10 h-16 flex items-center">
        <span className={`${playfair.className} text-xl`} style={{ color: 'var(--primary)' }}>Wedify</span>
      </nav>

      {/* ── HERO ─────────────────── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh' }}>

        {/* Cream radial glow — warm centre */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,242,228,0.90) 0%, rgba(250,244,237,0) 100%)' }} />

        {/* Paper texture */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/paper-texture.png" alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.06, mixBlendMode: 'multiply' }} />

        {/* Left botanical — top */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="absolute top-0 left-0 pointer-events-none select-none"
          style={{ width: '220px', opacity: 0.18, mixBlendMode: 'multiply', transform: 'rotate(8deg) translate(-20px, -20px)' }}
        />

        {/* Left botanical — bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="absolute bottom-0 left-0 pointer-events-none select-none"
          style={{ width: '180px', opacity: 0.14, mixBlendMode: 'multiply', transform: 'rotate(-12deg) translate(-10px, 20px)' }}
        />

        {/* Right botanical — top */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="absolute top-0 right-0 pointer-events-none select-none"
          style={{ width: '200px', opacity: 0.16, mixBlendMode: 'multiply', transform: 'scaleX(-1) rotate(8deg) translate(-20px, -20px)' }}
        />

        {/* Right botanical — bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="absolute bottom-0 right-0 pointer-events-none select-none"
          style={{ width: '160px', opacity: 0.12, mixBlendMode: 'multiply', transform: 'scaleX(-1) rotate(-12deg) translate(-10px, 20px)' }}
        />

        {/* Polaroid — floats left of center */}
        <div className="hidden lg:block absolute pointer-events-none select-none"
          style={{ left: 'calc(50% - 310px)', top: '50%', transform: 'translateY(-42%) rotate(-5deg)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/polaroid-laugh.png" alt=""
            style={{ width: '185px', filter: 'drop-shadow(0 8px 24px rgba(60,28,8,0.18))' }}
          />
        </div>

        {/* Flowers whisper — floats right of center */}
        <div className="hidden lg:block absolute pointer-events-none select-none"
          style={{ right: 'calc(50% - 330px)', top: '50%', transform: 'translateY(-50%) rotate(3deg)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/flowers.png" alt=""
            style={{ width: '215px', opacity: 0.82, filter: 'drop-shadow(0 6px 20px rgba(60,28,8,0.10))' }}
          />
        </div>

        {/* Center content */}
        <div className="relative text-center flex flex-col items-center px-6" style={{ maxWidth: '520px' }}>

          {/* Pill */}
          <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-7 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.60)', borderColor: 'rgba(201,149,108,0.22)', color: '#8a6448' }}>
            <Heart className="w-2.5 h-2.5 shrink-0" fill="currentColor" style={{ color: 'var(--primary)' }} />
            A new kind of wedding experience
          </div>

          {/* Headline */}
          <h1 className={`${playfair.className} font-bold mb-5`}
            style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', lineHeight: 1.10, color: '#1a0e06', letterSpacing: '-0.01em' }}>
            Your wedding,<br />co-created<br />
            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>by the people you love</em>
          </h1>

          {/* Body */}
          <p className="leading-relaxed mb-9" style={{ fontSize: '15px', color: '#7a5438', maxWidth: '380px' }}>
            Bring your favourite people together to contribute their skills, time and ideas.
            A wedding that&apos;s meaningful, personal, and truly unforgettable.
          </p>

          {/* CTA */}
          <Link href="/login">
            <Button size="lg" className="text-white px-10 h-11 text-sm"
              style={{ backgroundColor: 'var(--primary)', border: 'none', boxShadow: '0 4px 20px rgba(180,110,60,0.28)' }}>
              Start planning for free →
            </Button>
          </Link>

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
