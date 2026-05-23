'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, Heart, Users, Calendar, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/create')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f0e8' }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(201,149,108,0.18)',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-10 h-14 flex items-center justify-between gap-4">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-xl font-bold shrink-0"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)' }}
          >
            Wedify
          </Link>

          {/* Centre nav */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {([
              { icon: Heart, label: 'Co-create' },
              { icon: Users, label: 'Share' },
              { icon: Calendar, label: 'Organise' },
              { icon: Sparkles, label: 'Celebrate' },
            ] as const).map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)', opacity: 0.75 }} />
                {label}
              </span>
            ))}
          </div>

          {/* Right: Log in + Get started */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-sm font-medium hidden sm:block"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Log in
            </Link>
            <Button
              asChild
              className="h-9 px-5 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--primary)', border: 'none' }}
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col">

        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/cocreate.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />

        {/* Gradient overlay — cream fog heavier on the left for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(247,240,232,0.88) 0%, rgba(247,240,232,0.60) 28%, rgba(247,240,232,0.22) 50%, rgba(247,240,232,0.14) 100%)',
          }}
        />

        {/* Paper texture */}
        <div
          className="absolute inset-0 opacity-[0.09] pointer-events-none"
          style={{ backgroundImage: 'url(/assets/paper-texture.png)', backgroundRepeat: 'repeat', backgroundSize: '500px' }}
        />

        {/* 3-column content grid */}
        <div className="relative flex-1 flex items-center py-10">
          <div className="w-full max-w-6xl mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_360px_1fr] gap-8 lg:gap-10 items-center">

            {/* ── Left: Headline ─────────────────────────────── */}
            <div className="hidden lg:block">
              <h1
                className="text-4xl xl:text-5xl font-bold leading-tight mb-4"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: '#2d1f14',
                  textShadow: '0 1px 18px rgba(247,240,232,0.70)',
                }}
              >
                Co-create<br />the day of<br />your dreams
              </h1>
              {/* Heart divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12" style={{ background: 'rgba(160,114,72,0.45)' }} />
                <Heart className="w-3 h-3 shrink-0" style={{ color: 'var(--primary)', opacity: 0.70 }} />
                <div className="h-px w-12" style={{ background: 'rgba(160,114,72,0.45)' }} />
              </div>
              <p
                className="text-sm leading-relaxed max-w-[260px]"
                style={{ color: '#5a3e2b', textShadow: '0 1px 10px rgba(247,240,232,0.55)' }}
              >
                Invite your people, share what matters, and build a celebration that&apos;s truly yours—together.
              </p>
            </div>

            {/* ── Centre: Form card ──────────────────────────── */}
            <div>
              <div
                className="rounded-2xl p-7"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 12px 56px rgba(80,40,10,0.28), 0 3px 16px rgba(80,40,10,0.10)',
                  border: '1px solid rgba(255,255,255,0.85)',
                }}
              >
                {/* Card header */}
                <div className="text-center mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/wax-seal.png"
                    alt="Wedify"
                    className="w-14 h-14 object-cover rounded-full mx-auto mb-3"
                    style={{ boxShadow: '0 2px 12px rgba(180,130,60,0.25)' }}
                  />
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: '#2d1f14', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}
                  >
                    Create your account
                  </h2>
                  <p className="text-sm mt-0.5 italic" style={{ color: 'var(--primary)', opacity: 0.88 }}>
                    Your wedding story starts here.
                  </p>
                  {/* Botanical divider — sprite row 1, col 2 */}
                  <div className="mt-4 mb-1 mx-auto" style={{
                    backgroundImage: 'url(/assets/dividers.png)',
                    backgroundPosition: '100% 0%',
                    backgroundSize: '200% 600%',
                    backgroundRepeat: 'no-repeat',
                    width: '220px',
                    height: '49px',
                    mixBlendMode: 'multiply',
                  }} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#2d1f14' }}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--primary)' }} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="pl-9"
                        style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#2d1f14' }}>
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--primary)' }} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={6}
                        required
                        className="pl-9 pr-9"
                        style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <EyeOff className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          : <Eye className="w-4 h-4" style={{ color: 'var(--primary)' }} />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full text-white font-medium"
                    disabled={loading}
                    style={{ backgroundColor: 'var(--primary)', border: 'none' }}
                  >
                    {loading ? 'Creating account…' : 'Start planning for free'}
                  </Button>
                </form>

                <p className="text-center text-sm mt-4" style={{ color: '#8a6a50' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* ── Right: Polaroid stack ───────────────────────── */}
            <div className="hidden lg:flex flex-col items-center" style={{ paddingTop: '12px' }}>

              {/* table.png — white polaroid frame */}
              <div
                className="shrink-0"
                style={{
                  background: 'white',
                  padding: '10px 10px 34px 10px',
                  transform: 'rotate(-5deg)',
                  boxShadow: '0 8px 28px rgba(40,20,5,0.28), 0 2px 8px rgba(40,20,5,0.12)',
                  width: '216px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/table.png"
                  alt=""
                  aria-hidden
                  className="w-full h-[136px] object-cover select-none pointer-events-none"
                />
              </div>

              {/* polaroid-laugh.png */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/polaroid-laugh.png"
                alt=""
                aria-hidden
                className="w-[196px] select-none pointer-events-none shrink-0"
                style={{
                  transform: 'rotate(6deg)',
                  marginTop: '-30px',
                  marginLeft: '24px',
                  filter: 'drop-shadow(0 8px 22px rgba(40,20,5,0.30))',
                  position: 'relative',
                  zIndex: 1,
                }}
              />

              {/* wax-seal medallion */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/wax-seal.png"
                alt=""
                aria-hidden
                className="w-14 h-14 rounded-full object-cover shrink-0 select-none pointer-events-none"
                style={{
                  marginTop: '18px',
                  marginLeft: '-20px',
                  boxShadow: '0 4px 16px rgba(160,114,72,0.38)',
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Feature strip ──────────────────────────────────────── */}
      <div
        className="py-8 px-6"
        style={{
          background: 'rgba(255,255,255,0.94)',
          borderTop: '1px solid rgba(201,149,108,0.15)',
        }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {([
            { icon: Heart, title: 'Co-create together', desc: 'Invite your people and build the day together.' },
            { icon: Users, title: 'Share what you love', desc: "Everyone's talents make the day unforgettable." },
            { icon: Calendar, title: 'All in one place', desc: 'Tasks, guests, ideas and details beautifully organised.' },
            { icon: Sparkles, title: 'Made for moments', desc: 'Less stress, more connection, more memories.' },
          ] as const).map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="text-center px-4 py-2"
              style={{ borderRight: i < 3 ? '1px solid rgba(201,149,108,0.20)' : undefined }}
            >
              <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: 'var(--primary)', opacity: 0.65 }} />
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#2d1f14' }}>{title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#9a7a5a' }}>{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] mt-5" style={{ color: '#b09070' }}>
          Made with love for your big day ♥
        </p>
      </div>

    </div>
  )
}
