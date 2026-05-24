import Link from 'next/link'
import { Heart, Users, ClipboardList, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f1e8' }}>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="relative z-20 border-b border-[rgba(201,149,108,0.15)]" style={{ backgroundColor: '#f8f1e8' }}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className={`${playfair.className} text-2xl`} style={{ color: 'var(--primary)' }}>Wedify</span>
          <div className="hidden lg:flex items-center gap-10">
            {['How it works', 'Features', 'About', 'For vendors'].map(label => (
              <span key={label} className="text-sm font-medium cursor-default" style={{ color: '#5a3e28' }}>
                {label}
              </span>
            ))}
          </div>
          <Link href="/login">
            <Button className="text-white text-sm px-6 gap-1.5" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              Get started →
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Left botanical decoration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-corners.png" alt="" aria-hidden
          className="absolute left-0 top-0 pointer-events-none select-none"
          style={{ width: '340px', opacity: 0.55, mixBlendMode: 'multiply' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-corners.png" alt="" aria-hidden
          className="absolute left-0 bottom-0 pointer-events-none select-none"
          style={{ width: '300px', opacity: 0.40, mixBlendMode: 'multiply', transform: 'scaleY(-1)' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="absolute pointer-events-none select-none"
          style={{ left: '200px', top: '60%', width: '180px', opacity: 0.30, mixBlendMode: 'multiply', transform: 'rotate(15deg)' }}
        />

        {/* Main 3-col layout */}
        <div className="relative w-full max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr_360px] gap-8 items-center">

            {/* ── LEFT: polaroid floating over botanicals ── */}
            <div className="hidden xl:flex justify-end items-center pr-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/polaroid-laugh.png" alt=""
                className="select-none pointer-events-none"
                style={{ width: '220px', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 12px 32px rgba(80,40,10,0.28))' }}
              />
            </div>

            {/* ── CENTER: headline + copy + CTA ── */}
            <div className="text-center flex flex-col items-center">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-8 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderColor: 'rgba(201,149,108,0.25)', color: '#7a5c42', backdropFilter: 'blur(4px)' }}>
                <Heart className="w-3 h-3 shrink-0" fill="currentColor" style={{ color: 'var(--primary)' }} />
                A new kind of wedding experience
              </div>

              {/* Headline */}
              <h1 className={`${playfair.className} font-bold leading-[1.12] mb-6`}
                style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', color: '#1a0e06' }}>
                Your wedding,<br />co-created<br />
                <em style={{ color: 'var(--primary)' }}>by the people you love</em>
              </h1>

              {/* Body */}
              <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: '#6a4a30' }}>
                Bring your favourite people together to contribute their skills, time and ideas. Wedify helps you co-create a wedding that&apos;s meaningful, personal, and unforgettable.
              </p>

              {/* CTA */}
              <Link href="/signup">
                <Button size="lg" className="text-white px-10 text-base h-12 gap-2"
                  style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                  Start planning for free →
                </Button>
              </Link>

            </div>

            {/* ── RIGHT: flowers.png card ── */}
            <div className="hidden xl:flex justify-start items-center pl-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/flowers.png" alt="" aria-hidden
                className="select-none pointer-events-none"
                style={{
                  width: '320px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 40px rgba(120,72,28,0.15)',
                  border: '1px solid rgba(201,149,108,0.15)',
                }}
              />
            </div>

          </div>
        </div>

      </section>

      {/* ── DIVIDER ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 py-8 bg-white">
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
          <Link href="/signup">
            <Button size="lg" className="text-white px-10" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              Create your wedding page
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
