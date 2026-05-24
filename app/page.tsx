import Link from 'next/link'
import { Heart, Users, ClipboardList, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f1e8' }}>

      {/* ── NAV: wordmark only ─────────────────────────────────── */}
      <nav className="relative z-20 px-10 h-16 flex items-center">
        <span className={`${playfair.className} text-2xl`} style={{ color: 'var(--primary)' }}>Wedify</span>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative flex-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f8f1e8' }}>

        {/* LEFT flowers panel — flush to left edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/flowers.png" alt="" aria-hidden
          className="absolute left-0 top-0 h-full pointer-events-none select-none"
          style={{ width: '42%', objectFit: 'cover', objectPosition: 'right center' }}
        />
        {/* Fade left flowers into cream */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(248,241,232,0) 22%, rgba(248,241,232,0.55) 36%, rgba(248,241,232,0.92) 48%, #f8f1e8 58%)' }}
        />

        {/* RIGHT flowers panel — flush to right edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/flowers.png" alt="" aria-hidden
          className="absolute right-0 top-0 h-full pointer-events-none select-none"
          style={{ width: '30%', objectFit: 'cover', objectPosition: 'left center' }}
        />
        {/* Fade right flowers into cream */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(248,241,232,0) 18%, rgba(248,241,232,0.6) 30%, rgba(248,241,232,0.95) 44%, #f8f1e8 56%)' }}
        />

        {/* Polaroid — sits at the flowers / content boundary */}
        <div className="hidden lg:block absolute pointer-events-none select-none"
          style={{ left: '28%', top: '50%', transform: 'translateY(-45%) rotate(-4deg)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/polaroid-laugh.png" alt=""
            style={{ width: '210px', filter: 'drop-shadow(0 16px 40px rgba(60,28,8,0.30))' }}
          />
        </div>

        {/* CENTER content */}
        <div className="relative h-full flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center flex flex-col items-center px-4" style={{ maxWidth: '560px' }}>

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 text-xs px-5 py-2 rounded-full mb-8 border"
              style={{ backgroundColor: 'rgba(255,255,255,0.70)', borderColor: 'rgba(201,149,108,0.22)', color: '#7a5c42', backdropFilter: 'blur(6px)' }}>
              <Heart className="w-3 h-3 shrink-0" fill="currentColor" style={{ color: 'var(--primary)' }} />
              A new kind of wedding experience
            </div>

            {/* Headline */}
            <h1 className={`${playfair.className} font-bold leading-[1.10] mb-6`}
              style={{ fontSize: 'clamp(3rem, 5.5vw, 4.5rem)', color: '#1a0e06' }}>
              Your wedding,<br />co-created<br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>by the people you love</em>
            </h1>

            {/* Body */}
            <p className="text-base leading-relaxed mb-10"
              style={{ color: '#6a4a30', maxWidth: '420px' }}>
              Bring your favourite people together to contribute their skills, time and ideas. Wedify helps you co-create a wedding that&apos;s meaningful, personal, and unforgettable.
            </p>

            {/* CTA */}
            <Link href="/login">
              <Button size="lg" className="text-white px-10 text-sm h-12 gap-2"
                style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                Start planning for free →
              </Button>
            </Link>

          </div>
        </div>

      </section>

      {/* ── DIVIDER ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center py-8 bg-white">
        <div style={{ backgroundImage: 'url(/assets/dividers.png)', backgroundPosition: '0% 0%', backgroundSize: '200% 600%', backgroundRepeat: 'no-repeat', width: '120px', height: '36px', mixBlendMode: 'multiply', opacity: 0.65 }} />
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--primary)' }}>How it works</p>
          <h2 className={`${playfair.className} text-4xl font-bold mb-20`} style={{ color: '#1a0e06' }}>Four simple steps</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-12 gap-x-6">
            {[
              { icon: Heart,         title: 'Create your wedding', desc: 'Set up your wedding page with date, venue and the story of your day.' },
              { icon: Users,         title: 'Invite guests',       desc: 'Share a link or QR code. Guests join in seconds.' },
              { icon: ClipboardList, title: 'Post tasks & needs',  desc: 'Add things guests can help with — setup, food, music, photography and more.' },
              { icon: Gift,          title: 'Guests contribute',   desc: 'Guests claim tasks or offer their own skills, time and items. Everyone contributes.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center relative">
                {i < 3 && (
                  <div className="absolute top-7 left-[calc(50%+32px)] right-0 h-px hidden sm:block pointer-events-none"
                    style={{ background: 'linear-gradient(to right, var(--border) 60%, transparent)' }} />
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 relative z-10"
                  style={{ background: 'linear-gradient(145deg, #fdf3ea, #f0dfc8)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(201,149,108,0.15)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: 'linear-gradient(180deg, #fdf8f2 0%, var(--secondary) 100%)' }}>
        <div className="max-w-lg mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/cocreate.png" alt="" className="w-20 mx-auto mb-6 select-none" style={{ opacity: 0.75, mixBlendMode: 'multiply' }} />
          <h2 className={`${playfair.className} text-3xl font-bold mb-4`}>Ready to plan differently?</h2>
          <p className="mb-9 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Join couples co-creating their wedding with their community.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-white px-10" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              Get started
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
        © 2026 Wedify
      </footer>

    </div>
  )
}
