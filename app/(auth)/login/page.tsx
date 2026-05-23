'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('planner_id', data.user.id)
        .single()
      router.push(wedding ? `/dashboard/${wedding.id}` : '/create')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col" style={{ backgroundColor: '#f7f0e8' }}>

      {/* ── Background ── */}
      <div className="absolute inset-0">
        <img
          src="/assets/background.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
        {/* Even warm cream fog — concept + ~10% extra */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(247,240,232,0.42)' }} />
        {/* Atmospheric veil — feathered warm shadow behind wordmark, barely visible */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 660px 240px at 50% 22%, rgba(110,65,25,0.08) 0%, transparent 100%)' }} />
      </div>

      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/paper-texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '500px',
        }}
      />

      {/* ── Content ── */}
      <div className="relative flex flex-col min-h-screen">

        {/* ── Wordmark ── */}
        <div className="text-center pt-24 pb-3">
          {/* Botanical flourishes flanking the wordmark */}
          <div className="flex items-center justify-center gap-4">
            <div style={{
              backgroundImage: 'url(/assets/dividers.png)',
              backgroundPosition: '0% 0%',
              backgroundSize: '200% 600%',
              backgroundRepeat: 'no-repeat',
              width: '72px',
              height: '16px',
              opacity: 0.55,
              transform: 'scaleX(-1)',
            }} />
            <Link href="/">
              <span
                className="text-5xl font-bold tracking-tight"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)', textShadow: '0 0px 28px rgba(247,240,232,0.72)' }}
              >
                Wedify
              </span>
            </Link>
            <div style={{
              backgroundImage: 'url(/assets/dividers.png)',
              backgroundPosition: '0% 0%',
              backgroundSize: '200% 600%',
              backgroundRepeat: 'no-repeat',
              width: '72px',
              height: '16px',
              opacity: 0.55,
            }} />
          </div>
          {/* Brand tagline */}
          <p
            className="italic mt-2.5"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)', fontSize: '15.5px', letterSpacing: '0.04em', opacity: 0.88, textShadow: '0 0px 16px rgba(247,240,232,0.65)' }}
          >
            Built together. Remembered forever.
          </p>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="flex items-center justify-center gap-10 w-full max-w-[820px]">

            {/* ── Form card ── */}
            <div className="w-full max-w-[340px] shrink-0">
              <div
                className="rounded-2xl p-7"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.93)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 50px rgba(120,72,28,0.23), 0 3px 14px rgba(120,72,28,0.11)',
                  border: '1px solid rgba(255,255,255,0.80)',
                }}
              >
                {/* Card header */}
                <div className="text-center mb-5">
                  <img
                    src="/assets/wax-seal.png"
                    alt="Wedify"
                    className="w-14 h-14 object-cover rounded-full mx-auto mb-3"
                    style={{ boxShadow: '0 3px 14px rgba(160,114,72,0.28)' }}
                  />
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: '#2d1f14', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}
                  >
                    Welcome back
                  </h2>
                  <p className="text-sm mt-1 italic" style={{ color: 'var(--primary)', opacity: 0.85 }}>
                    Let's continue creating something beautiful.
                  </p>
                  {/* Botanical divider — sprite row 1, col 2 */}
                  <div className="mt-3 mb-1 mx-auto" style={{
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#2d1f14' }}>
                        Password
                      </Label>
                      <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--primary)' }}>
                        Forgot password?
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--primary)' }} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </form>

                <p className="text-center text-sm mt-4" style={{ color: '#8a6a50' }}>
                  No account?{' '}
                  <Link href="/signup" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* ── Polaroid ── */}
            <div className="hidden lg:flex flex-col items-start shrink-0 relative" style={{ paddingTop: '16px' }}>
              <img
                src="/assets/polaroid-laugh.png"
                alt="Co-creating the day together"
                className="w-[300px]"
                style={{
                  transform: 'rotate(5deg)',
                  transformOrigin: 'center bottom',
                  filter: 'drop-shadow(0 16px 40px rgba(80,50,20,0.30)) drop-shadow(0 4px 12px rgba(80,50,20,0.16))',
                }}
              />
              <img
                src="/assets/botanical-design.png"
                alt=""
                className="w-[180px] mt-[-28px] ml-[-16px]"
                style={{
                  transform: 'rotate(-5deg)',
                  filter: 'drop-shadow(0 6px 16px rgba(80,50,20,0.18))',
                  opacity: 0.90,
                }}
              />
            </div>

          </div>
        </div>

        {/* ── Feature strip ── */}
        <div
          className="py-8 px-6"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0.60))',
            borderTop: '1px solid rgba(201,149,108,0.15)',
          }}
        >
          <div className="max-w-3xl mx-auto grid grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🤝', title: 'Co-create together', desc: 'Invite your people and build the day together.' },
              { icon: '✨', title: 'Share what you love', desc: "Everyone's talents make the day unforgettable." },
              { icon: '📋', title: 'All in one place', desc: 'Tasks, guests and ideas beautifully organised.' },
              { icon: '💛', title: 'Made for moments', desc: 'Less stress, more connection, more memories.' },
            ].map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="text-center px-4 py-2"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(201,149,108,0.20)' : undefined,
                }}
              >
                <div className="text-2xl mb-1.5">{icon}</div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#2d1f14' }}>{title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: '#9a7a5a' }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* ── Brand statement ── */}
          <div className="flex items-center justify-center gap-5 mt-6">
            <div style={{
              backgroundImage: 'url(/assets/dividers.png)',
              backgroundPosition: '0% 0%',
              backgroundSize: '200% 600%',
              backgroundRepeat: 'no-repeat',
              width: '80px',
              height: '18px',
              mixBlendMode: 'multiply',
              opacity: 0.60,
              transform: 'scaleX(-1)',
            }} />
            <p
              className="text-sm italic"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)', letterSpacing: '0.02em' }}
            >
              Built together. Remembered forever.
            </p>
            <div style={{
              backgroundImage: 'url(/assets/dividers.png)',
              backgroundPosition: '0% 0%',
              backgroundSize: '200% 600%',
              backgroundRepeat: 'no-repeat',
              width: '80px',
              height: '18px',
              mixBlendMode: 'multiply',
              opacity: 0.60,
            }} />
          </div>

        </div>

      </div>
    </div>
  )
}
