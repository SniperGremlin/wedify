import Link from 'next/link'
import { Heart, Users, ClipboardList, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className={`${playfair.className} text-2xl`} style={{ color: 'var(--primary)' }}>Wedify</span>
          <div className="hidden lg:flex items-center gap-8">
            {['How it works', 'Features', 'About', 'For vendors'].map(label => (
              <Link key={label} href="/login" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#3d2510' }}>
                {label}
              </Link>
            ))}
          </div>
          <Link href="/login">
            <Button size="sm" className="text-white text-sm px-5 gap-1.5" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              Get started →
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '620px', backgroundColor: '#f5ede0' }}>

        {/* Flowers — left side, full bleed, mirrored to face inward */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/flowers.png" alt="" aria-hidden
          className="absolute left-0 top-0 h-full pointer-events-none select-none"
          style={{ width: '46%', objectFit: 'cover', objectPosition: 'right center', mixBlendMode: 'multiply', transform: 'scaleX(-1)' }}
        />

        {/* Gradient: transparent on far left → cream from ~38% onward */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(245,237,224,0) 20%, rgba(245,237,224,0.75) 38%, #f5ede0 52%)' }}
        />

        {/* Polaroid — sits at the flowers/content boundary */}
        <div className="hidden lg:block absolute pointer-events-none select-none"
          style={{ left: '26%', bottom: '60px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/polaroid-laugh.png" alt=""
            className="w-44 drop-shadow-2xl"
            style={{ transform: 'rotate(-5deg)' }}
          />
        </div>

        {/* Main content */}
        <div className="relative max-w-7xl mx-auto px-8 pt-24 pb-16 min-h-[620px] flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-center lg:pl-[280px]">

            {/* Center: headline + text + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-6 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.60)', borderColor: 'rgba(201,149,108,0.30)', color: '#7a5c42', backdropFilter: 'blur(4px)' }}>
                <Heart className="w-3 h-3" fill="currentColor" style={{ color: 'var(--primary)' }} />
                A new kind of wedding experience
              </div>

              <h1 className={`${playfair.className} font-bold leading-[1.15] mb-5`}
                style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', color: '#1e1108' }}>
                Your wedding,<br />co-created<br />
                <em style={{ color: 'var(--primary)' }}>by the people you love</em>
              </h1>

              <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: '#6a4a30' }}>
                Bring your favourite people together to contribute their skills, time and ideas. Wedify helps you co-create a wedding that&apos;s meaningful, personal, and unforgettable.
              </p>

              <Link href="/signup">
                <Button size="lg" className="text-white px-8 gap-2" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                  Start planning for free →
                </Button>
              </Link>
            </div>

            {/* Right: quote card */}
            <div className="hidden lg:block relative">
              <div className="rounded-2xl p-7 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 32px rgba(120,72,28,0.10)', border: '1px solid rgba(201,149,108,0.18)' }}>
                {/* Large quote mark */}
                <span className="block text-5xl leading-none mb-3 font-serif" style={{ color: 'var(--primary)', opacity: 0.55 }}>&ldquo;</span>
                <p className={`${playfair.className} text-xl leading-snug mb-4`}
                  style={{ color: 'var(--primary)', fontStyle: 'italic' }}>
                  The best weddings aren&apos;t perfect. They&apos;re personal.
                </p>
                <Heart className="w-4 h-4" style={{ color: 'var(--primary)', opacity: 0.55 }} />
                {/* Botanical overlay bottom-right */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/botanical-design.png" alt="" aria-hidden
                  className="absolute -bottom-4 -right-4 w-36 pointer-events-none select-none"
                  style={{ opacity: 0.30, mixBlendMode: 'multiply' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DIVIDER ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 py-6 bg-white">
        <div style={{ backgroundImage: 'url(/assets/dividers.png)', backgroundPosition: '0% 0%', backgroundSize: '200% 600%', backgroundRepeat: 'no-repeat', width: '160px', height: '40px', mixBlendMode: 'multiply', opacity: 0.7 }} />
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--primary)' }}>How it works</p>
          <h2 className={`${playfair.className} text-4xl font-bold mb-16`}>Four simple steps</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-6">
            {[
              { icon: Heart,        title: 'Create your wedding', desc: 'Set up your wedding page with date, venue and the story of your day.' },
              { icon: Users,        title: 'Invite guests',       desc: 'Share a link or QR code. Guests join in seconds.' },
              { icon: ClipboardList,title: 'Post tasks & needs',  desc: 'Add things guests can help with — setup, food, music, photography and more.' },
              { icon: Gift,         title: 'Guests contribute',   desc: 'Guests claim tasks or offer their own skills, time and items. Everyone contributes.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center relative">
                {i < 3 && (
                  <div className="absolute top-7 left-[calc(50%+32px)] right-0 h-px hidden sm:block pointer-events-none"
                    style={{ background: 'linear-gradient(to right, var(--border) 60%, transparent)' }} />
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 relative z-10"
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
      <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(180deg, #fdf8f2 0%, var(--secondary) 100%)' }}>
        <div className="max-w-lg mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/cocreate.png" alt="" className="w-20 mx-auto mb-6 select-none" style={{ opacity: 0.75, mixBlendMode: 'multiply' }} />
          <h2 className={`${playfair.className} text-3xl font-bold mb-3`}>Ready to plan differently?</h2>
          <p className="mb-8 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
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
