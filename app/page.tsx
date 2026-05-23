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
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-white text-sm px-5" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '600px', backgroundColor: '#f5ede0' }}>

        {/* Flowers — right side, full bleed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/flowers.png" alt="" aria-hidden
          className="absolute right-0 top-0 h-full pointer-events-none select-none"
          style={{ width: '55%', objectFit: 'cover', objectPosition: 'left center', mixBlendMode: 'multiply' }}
        />

        {/* Gradient fade: cream on left, transparent on right so flowers show */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f5ede0 30%, rgba(245,237,224,0.7) 55%, rgba(245,237,224,0) 75%)' }}
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-8 pt-28 pb-20 flex items-center min-h-[600px]">

          {/* Polaroid — left */}
          <div className="hidden lg:block absolute left-8 bottom-16 select-none pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/polaroid-laugh.png" alt=""
              className="w-48 drop-shadow-xl"
              style={{ transform: 'rotate(-5deg)' }}
            />
          </div>

          {/* Center text */}
          <div className="w-full max-w-lg mx-auto text-center lg:ml-52">

            <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-7 border"
              style={{ backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(201,149,108,0.30)', color: '#7a5c42', backdropFilter: 'blur(4px)' }}>
              <Heart className="w-3 h-3" fill="currentColor" style={{ color: 'var(--primary)' }} />
              A new kind of wedding experience
            </div>

            <h1 className={`${playfair.className} font-bold leading-tight mb-6`} style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: '#1e1108' }}>
              Your wedding,<br />co-created<br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>by the people you love</em>
            </h1>

            <p className="text-base leading-relaxed mb-9 max-w-sm mx-auto" style={{ color: '#6a4a30' }}>
              Stop paying strangers to do what your people would love to help with. Wedify lets guests contribute their skills, time, and talents — turning your wedding into something truly communal.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-white w-full sm:w-auto px-8"
                  style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                  Start planning for free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto"
                  style={{ color: '#6a4a30' }}>
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 py-5 bg-white">
        <div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
        <span style={{ color: 'var(--primary)', opacity: 0.6 }}>✦</span>
        <div className="h-px w-24" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--primary)' }}>How it works</p>
          <h2 className={`${playfair.className} text-3xl font-bold mb-16`}>Four simple steps</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-4">
            {[
              { icon: Heart, title: 'Create your wedding', desc: 'Set up your wedding page with date, venue, and the story of your day.' },
              { icon: Users, title: 'Invite guests', desc: 'Share a QR code or link on your invitations. Guests join in seconds.' },
              { icon: ClipboardList, title: 'Post tasks & needs', desc: 'Add things guests can help with — setup, food, music, photography.' },
              { icon: Gift, title: 'Guests contribute', desc: 'Guests claim tasks or volunteer their own skills and equipment.' },
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
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
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
