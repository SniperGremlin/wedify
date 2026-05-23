import Link from 'next/link'
import { Heart, Users, ClipboardList, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className={`${playfair.className} text-xl text-[var(--primary)]`}>Wedify</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #fdf8f2 0%, #f4e8d8 55%, #ede0cc 100%)',
        minHeight: '520px',
      }}>
        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/paper-texture.png)',
            backgroundSize: 'cover',
            opacity: 0.25,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Botanical corners */}
        <img
          src="/assets/botanical-corners.png"
          alt=""
          className="absolute top-0 left-0 w-44 sm:w-56 pointer-events-none select-none"
          style={{ opacity: 0.45 }}
        />
        <img
          src="/assets/botanical-corners.png"
          alt=""
          className="absolute top-0 right-0 w-44 sm:w-56 pointer-events-none select-none"
          style={{ opacity: 0.45, transform: 'scaleX(-1)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-8 items-center">

            {/* Left: polaroid */}
            <div className="hidden lg:flex justify-center items-center">
              <img
                src="/assets/polaroid-laugh.png"
                alt=""
                className="w-52 drop-shadow-xl select-none"
                style={{ transform: 'rotate(-5deg)' }}
              />
            </div>

            {/* Center: text */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm text-[var(--muted-foreground)] text-xs px-4 py-1.5 rounded-full mb-7 border border-[var(--border)]/50">
                <Heart className="w-3 h-3 text-[var(--primary)]" fill="currentColor" />
                A new kind of wedding experience
              </div>

              <h1 className={`${playfair.className} text-4xl sm:text-5xl font-bold leading-tight mb-5`}>
                Your wedding, co-created<br />
                <span className={`${playfair.className} italic`} style={{ color: 'var(--primary)' }}>
                  by the people you love
                </span>
              </h1>

              <p className="text-[var(--muted-foreground)] text-base leading-relaxed mb-8 max-w-md mx-auto">
                Stop paying strangers to do what your people would love to help with.
                Wedify lets guests contribute their skills, time, and talents —
                turning your wedding into something truly communal.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white w-full sm:w-auto px-8">
                    Start planning for free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    I have an account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: botanical design */}
            <div className="hidden lg:flex justify-center items-center">
              <img
                src="/assets/botanical-design.png"
                alt=""
                className="w-52 select-none"
                style={{ opacity: 0.85, transform: 'rotate(3deg)' }}
              />
            </div>
          </div>

          {/* Mobile: show polaroid below text */}
          <div className="flex lg:hidden justify-center mt-10">
            <img
              src="/assets/polaroid-laugh.png"
              alt=""
              className="w-44 drop-shadow-lg select-none"
              style={{ transform: 'rotate(-3deg)' }}
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 py-5 bg-white">
        <div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
        <span className="text-sm" style={{ color: 'var(--primary)', opacity: 0.6 }}>✦</span>
        <div className="h-px w-24" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
      </div>

      {/* How it works */}
      <section className="bg-white pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] mb-2">How it works</p>
          <h2 className={`${playfair.className} text-3xl font-bold mb-16`}>Four simple steps</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-4">
            {[
              { icon: Heart, title: 'Create your wedding', desc: 'Set up your wedding page with date, venue, and the story of your day.' },
              { icon: Users, title: 'Invite guests', desc: 'Share a QR code or link on your invitations. Guests join in seconds.' },
              { icon: ClipboardList, title: 'Post tasks & needs', desc: 'Add things guests can help with — setup, food, music, photography.' },
              { icon: Gift, title: 'Guests contribute', desc: 'Guests claim tasks or volunteer their own skills and equipment.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center relative">
                {/* Connector */}
                {i < 3 && (
                  <div
                    className="absolute top-7 left-[calc(50%+32px)] right-0 h-px hidden sm:block pointer-events-none"
                    style={{ background: 'linear-gradient(to right, var(--border) 60%, transparent)' }}
                  />
                )}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 relative z-10"
                  style={{
                    background: 'linear-gradient(145deg, #fdf3ea, #f0dfc8)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 12px rgba(201,149,108,0.15)',
                  }}
                >
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #fdf8f2 0%, var(--secondary) 100%)' }}
      >
        <div className="max-w-lg mx-auto">
          <img
            src="/assets/cocreate.png"
            alt=""
            className="w-20 mx-auto mb-6 select-none"
            style={{ opacity: 0.75, mixBlendMode: 'multiply' }}
          />
          <h2 className={`${playfair.className} text-3xl font-bold mb-3`}>Ready to plan differently?</h2>
          <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
            Join couples co-creating their wedding with their community.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white px-10">
              Create your wedding page
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted-foreground)]">
        © 2026 Wedify
      </footer>
    </div>
  )
}
