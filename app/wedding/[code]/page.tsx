'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Wedding, Task, Offer, TaskComment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Heart, Calendar, MapPin, Plus, Check, MessageCircle, Send, Bell,
  ChevronDown, Hammer, UtensilsCrossed, Music, Camera, Armchair,
  Bus, Home, Lightbulb, Wrench, Sparkles, Package, Truck, Star, Gift,
} from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  setup: 'Setup', food: 'Food', music: 'Music',
  photography: 'Photography', decor: 'Decor', transport: 'Transport',
  accommodation: 'Accommodation', skill: 'Skill', equipment: 'Equipment', other: 'Other',
}

type CatIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

const CATEGORY_CONFIG: Record<string, { bg: string; color: string; Icon: CatIcon }> = {
  setup:         { bg: '#fce8d5', color: '#c07040', Icon: Hammer },
  food:          { bg: '#fef3e2', color: '#b87020', Icon: UtensilsCrossed },
  music:         { bg: '#ede8f8', color: '#7050c0', Icon: Music },
  photography:   { bg: '#e8f0fe', color: '#3060c0', Icon: Camera },
  decor:         { bg: '#fce8f0', color: '#c04080', Icon: Armchair },
  transport:     { bg: '#e2f4e8', color: '#30a060', Icon: Bus },
  accommodation: { bg: '#e8f6f4', color: '#20a090', Icon: Home },
  skill:         { bg: '#fef9e8', color: '#a08020', Icon: Lightbulb },
  equipment:     { bg: '#f4ede8', color: '#806040', Icon: Wrench },
  other:         { bg: '#f5f0eb', color: '#907060', Icon: Sparkles },
}

const ALL_CATEGORIES = ['setup','food','music','photography','decor','transport','accommodation','skill','equipment','other'] as const

type Step = 'join' | 'rsvp' | 'main'

export default function GuestPage() {
  const { code } = useParams<{ code: string }>()
  const supabase = createClient()

  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [step, setStep] = useState<Step>('join')
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  const [rsvp, setRsvp] = useState<'yes' | 'no' | 'maybe'>('yes')
  const [rsvpLoading, setRsvpLoading] = useState(false)

  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null)
  const [taskComments, setTaskComments] = useState<Record<string, TaskComment[]>>({})
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerForm, setOfferForm] = useState({ title: '', description: '', category: 'other' })
  const [offerLoading, setOfferLoading] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState(false)

  const [currentRsvp, setCurrentRsvp] = useState<string>('pending')
  const [showRsvpEdit, setShowRsvpEdit] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(false)

  const loadWedding = useCallback(async () => {
    const { data } = await supabase.from('weddings').select('*').eq('invite_code', code).single()
    if (!data) { setLoading(false); return }
    setWedding(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      const { data: member } = await supabase
        .from('wedding_members').select('*').eq('wedding_id', data.id).eq('user_id', user.id).single()
      if (member) {
        setMemberId(member.id)
        setDisplayName(member.display_name)
        setCurrentRsvp(member.rsvp)
        await loadContent(data.id, user.id)
        setStep('main')
        setLoading(false)
        return
      }
    }
    setLoading(false)
  }, [code, supabase])

  async function loadContent(weddingId: string, uid: string) {
    const [tasksRes, offersRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('wedding_id', weddingId).order('created_at'),
      supabase.from('offers').select('*').eq('wedding_id', weddingId).eq('user_id', uid),
    ])
    setTasks(tasksRes.data || [])
    setMyOffers(offersRes.data || [])
  }

  useEffect(() => { loadWedding() }, [loadWedding])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!wedding) return
    setJoinLoading(true)
    setJoinError('')

    let uid = userId
    if (!uid) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const redirectTo = `${window.location.origin}/auth/callback?next=/wedding/${code}`
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        if (signUpError) { setJoinError(signUpError.message); setJoinLoading(false); return }
        if (!signUpData.user?.id) { setJoinError('Check your email for a confirmation link, then come back to join.'); setJoinLoading(false); return }
        uid = signUpData.user.id
      } else {
        uid = signInData.user?.id || null
      }
    }

    if (!uid) { setJoinError('Something went wrong — please try again.'); setJoinLoading(false); return }
    setUserId(uid)

    const { data: existing } = await supabase.from('wedding_members').select('id, display_name').eq('wedding_id', wedding.id).eq('user_id', uid).single()
    if (existing) {
      setMemberId(existing.id); setDisplayName(existing.display_name)
      await loadContent(wedding.id, uid); setStep('main'); setJoinLoading(false); return
    }

    const { data: member, error: memberError } = await supabase.from('wedding_members')
      .insert({ wedding_id: wedding.id, user_id: uid, display_name: displayName }).select().single()
    if (memberError) { setJoinError(memberError.message); setJoinLoading(false); return }
    setMemberId(member.id)
    await loadContent(wedding.id, uid)
    setStep('rsvp')
    setJoinLoading(false)
  }

  async function handleRsvp() {
    if (!wedding || !memberId) return
    setRsvpLoading(true)
    await supabase.from('wedding_members').update({ rsvp }).eq('id', memberId)
    setCurrentRsvp(rsvp); setStep('main'); setRsvpLoading(false)
  }

  async function notify(type: string, message: string) {
    if (!wedding) return
    fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wedding_id: wedding.id, type, message }) }).catch(() => {})
  }

  async function updateRsvp(newRsvp: string) {
    if (!memberId) return
    await supabase.from('wedding_members').update({ rsvp: newRsvp }).eq('id', memberId)
    setCurrentRsvp(newRsvp); setShowRsvpEdit(false)
  }

  async function unclaimTask(task: Task) {
    const { data } = await supabase.from('tasks')
      .update({ status: 'open', claimed_by: null, claimed_at: null }).eq('id', task.id).select().single()
    if (data) setTasks(t => t.map(tt => tt.id === task.id ? data : tt))
  }

  async function claimTask(task: Task) {
    if (!userId || !wedding) return
    const { data } = await supabase.from('tasks')
      .update({ status: 'claimed', claimed_by: userId, claimed_at: new Date().toISOString() }).eq('id', task.id).select().single()
    if (data) { setTasks(t => t.map(tt => tt.id === task.id ? data : tt)); notify('task_claimed', `${displayName} is co-creating "${task.title}"`) }
  }

  async function openComments(taskId: string) {
    if (openCommentTaskId === taskId) { setOpenCommentTaskId(null); return }
    setCommentText(''); setOpenCommentTaskId(taskId)
    if (!taskComments[taskId]) {
      const { data } = await supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
      setTaskComments(c => ({ ...c, [taskId]: data || [] }))
    }
  }

  async function submitComment(taskId: string) {
    if (!commentText.trim() || !userId) return
    setCommentLoading(true)
    const { data } = await supabase.from('task_comments').insert({
      task_id: taskId, wedding_id: wedding!.id, user_id: userId, display_name: displayName, message: commentText.trim(),
    }).select().single()
    if (data) {
      setTaskComments(c => ({ ...c, [taskId]: [...(c[taskId] || []), data] }))
      const task = tasks.find(t => t.id === taskId)
      notify('comment_posted', `${displayName} left a message on "${task?.title}"`)
    }
    setCommentText(''); setCommentLoading(false)
  }

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault()
    if (!wedding || !userId || !offerForm.title.trim()) return
    setOfferLoading(true)
    const { data } = await supabase.from('offers').insert({
      wedding_id: wedding.id, user_id: userId, display_name: displayName,
      title: offerForm.title, description: offerForm.description || null, category: offerForm.category,
    }).select().single()
    if (data) { setMyOffers(o => [data, ...o]); notify('offer_submitted', `${displayName} made an offer: "${offerForm.title}"`) }
    setOfferForm({ title: '', description: '', category: 'other' })
    setShowOfferForm(false); setOfferLoading(false); setOfferSuccess(true)
    setTimeout(() => setOfferSuccess(false), 3500)
  }

  function renderCommentThread(taskId: string) {
    return (
      <div className="mt-3 pt-3 border-t border-[var(--border)]/40 space-y-2 px-1">
        {(taskComments[taskId] || []).length === 0 && (
          <p className="text-xs text-[var(--muted-foreground)] text-center py-1">No messages yet — ask a question or leave a note.</p>
        )}
        {(taskComments[taskId] || []).map(comment => (
          <div key={comment.id} className={`flex gap-2 ${comment.user_id === userId ? 'flex-row-reverse' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-semibold text-[var(--primary)] shrink-0">
              {comment.display_name.charAt(0).toUpperCase()}
            </div>
            <div className={`max-w-[75%] flex flex-col ${comment.user_id === userId ? 'items-end' : 'items-start'}`}>
              <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{comment.display_name}</p>
              <div className={`rounded-xl px-3 py-1.5 text-xs ${comment.user_id === userId ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>
                {comment.message}
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <input type="text" placeholder="Ask a question or leave a note…" value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(taskId) } }}
            className="flex-1 text-xs rounded-lg border border-[var(--border)] px-3 py-1.5 bg-white focus:outline-none focus:border-[var(--primary)]"
          />
          <button onClick={() => submitComment(taskId)} disabled={commentLoading || !commentText.trim()}
            className="p-1.5 rounded-lg bg-[var(--primary)] text-white disabled:opacity-40 hover:bg-[#b8845b] transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-lg font-semibold mb-2">Invite not found</p>
          <p className="text-[var(--muted-foreground)] text-sm">This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  // ── JOIN STEP ──────────────────────────────────────────────────────────────
  if (step === 'join') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#faf8f5' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/botanical-design.png" alt="" aria-hidden
          className="fixed top-0 right-0 w-64 pointer-events-none select-none opacity-20"
          style={{ mixBlendMode: 'multiply' }} />
        <div className="w-full max-w-sm relative">
          <div className="text-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/wax-seal.png" alt="Wedify" className="w-16 h-16 object-cover rounded-full mx-auto mb-3"
              style={{ boxShadow: '0 4px 16px rgba(180,130,60,0.3)' }} />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#2d1f14' }}>{wedding.couple_names}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">You&apos;ve been invited to co-create their wedding</p>
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap text-xs text-[var(--muted-foreground)]">
              {wedding.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(wedding.date).toLocaleDateString('en-AU', { dateStyle: 'long' })}</span>}
              {wedding.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{wedding.venue}</span>}
            </div>
            {wedding.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-3 bg-white rounded-xl px-4 py-3 text-left border border-[var(--border)]">{wedding.description}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-[0_4px_24px_rgba(120,72,28,0.12)]">
            <h2 className="font-semibold text-center mb-1" style={{ color: '#2d1f14' }}>Join the celebration</h2>
            <div className="flex justify-center my-2">
              <div style={{ backgroundImage: 'url(/assets/dividers.png)', backgroundPosition: '100% 0%', backgroundSize: '200% 600%', backgroundRepeat: 'no-repeat', width: '200px', height: '44px', mixBlendMode: 'multiply' }} />
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" placeholder="e.g. Emma Williams" value={displayName} onChange={e => setDisplayName(e.target.value)} required style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create or enter existing password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }} />
                <p className="text-xs text-[var(--muted-foreground)]">New here? We&apos;ll create your account automatically.</p>
              </div>
              {joinError && <p className="text-sm text-red-500">{joinError}</p>}
              <Button type="submit" className="w-full text-white" disabled={joinLoading} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                {joinLoading ? 'Joining…' : 'Join the wedding →'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── RSVP STEP ──────────────────────────────────────────────────────────────
  if (step === 'rsvp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#faf8f5' }}>
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: 'var(--secondary)' }}>
            <Heart className="w-7 h-7" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#2d1f14' }}>Hey {displayName}! 👋</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-5">Will you be joining {wedding.couple_names}?</p>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm space-y-3">
            {([{ value: 'yes', label: "Yes, I'll be there! 🎉" }, { value: 'maybe', label: "Maybe, I'll let you know 🤔" }, { value: 'no', label: "Sorry, I can't make it 😢" }] as const).map(opt => (
              <button key={opt.value} type="button" onClick={() => setRsvp(opt.value)}
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium transition-all ${rsvp === opt.value ? 'border-[var(--primary)] bg-[var(--secondary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/40'}`}>
                {opt.label}
              </button>
            ))}
            <Button className="w-full text-white mt-2" onClick={handleRsvp} disabled={rsvpLoading} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
              {rsvpLoading ? 'Saving…' : 'Confirm RSVP →'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN GUEST VIEW ─────────────────────────────────────────────────────────
  const openTasks = tasks.filter(t => t.status === 'open')
  const myClaimedTasks = tasks.filter(t => t.claimed_by === userId)
  const visibleTasks = showAllTasks ? openTasks : openTasks.slice(0, 3)

  const initials = displayName.split(' ').map(n => n[0]?.toUpperCase() ?? '').slice(0, 2).join('')

  const botanicalDivider = (
    <div className="flex justify-center">
      <div style={{ backgroundImage: 'url(/assets/dividers.png)', backgroundPosition: '0% 0%', backgroundSize: '200% 600%', backgroundRepeat: 'no-repeat', width: '220px', height: '48px', mixBlendMode: 'multiply' }} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf8f5' }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <span className="font-bold text-lg shrink-0" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)' }}>Wedify</span>
          <div className="flex items-center gap-2 text-sm font-semibold truncate">
            <span>{wedding.couple_names}</span>
            {wedding.date && (
              <>
                <span className="text-[var(--muted-foreground)] font-normal hidden sm:inline">·</span>
                <span className="text-[var(--muted-foreground)] font-normal hidden sm:inline">
                  {new Date(wedding.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors">
              <Bell className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold" style={{ color: 'var(--primary)' }}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* ── LEFT SIDEBAR ────────────────────────────────────── */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-14 overflow-hidden border-r border-[var(--border)] relative" style={{ height: 'calc(100vh - 3.5rem)' }}>
          {/* Background photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/background.png" alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.55, objectPosition: 'center 25%' }}
          />
          {/* Gradient: photo at top, cream fade at bottom */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(247,240,232,0.18) 0%, rgba(247,240,232,0.60) 40%, rgba(247,240,232,0.93) 62%, rgba(247,240,232,1) 76%)' }} />
          {/* Botanical accent */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/botanical-design.png" alt="" aria-hidden
            className="absolute right-0 top-12 w-24 pointer-events-none select-none"
            style={{ opacity: 0.28, mixBlendMode: 'multiply', transform: 'rotate(12deg)' }}
          />

          {/* Scrollable content */}
          <div className="relative h-full flex flex-col overflow-y-auto">
            <div style={{ height: '220px', flexShrink: 0 }} />

            {/* Text */}
            <div className="px-5 py-4">
              <h2 style={{ fontFamily: 'Georgia, serif', color: '#2d1f14', fontSize: '20px', lineHeight: 1.35, fontWeight: 700 }}>
                Together we create a day worth{' '}
                <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>remembering.</em>
              </h2>
              <div className="flex items-center gap-3 my-3">
                <div className="h-px flex-1" style={{ background: 'rgba(160,114,72,0.35)' }} />
                <Heart className="w-3 h-3 shrink-0" style={{ color: 'var(--primary)', opacity: 0.65 }} />
                <div className="h-px flex-1" style={{ background: 'rgba(160,114,72,0.35)' }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6a4a32' }}>
                Share your ideas, talents and time to bring {wedding.couple_names}&apos;s celebration to life.
              </p>
            </div>

            {/* Polaroid stack */}
            <div className="px-4 pb-6 flex flex-col items-start">
              <div style={{ background: 'white', padding: '7px 7px 22px', transform: 'rotate(-4deg)', boxShadow: '0 4px 14px rgba(60,30,10,0.24)', marginLeft: '10px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/table.png" alt="" aria-hidden className="w-36 h-[88px] object-cover pointer-events-none select-none" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/polaroid-laugh.png" alt="" aria-hidden
                className="w-32 pointer-events-none select-none"
                style={{ transform: 'rotate(5deg)', marginTop: '-16px', marginLeft: '22px', filter: 'drop-shadow(0 5px 14px rgba(60,30,10,0.22))' }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/botanical-design.png" alt="" aria-hidden
                className="w-14 pointer-events-none select-none mt-4"
                style={{ opacity: 0.60, mixBlendMode: 'multiply', transform: 'rotate(-8deg)', marginLeft: '6px' }}
              />
            </div>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 space-y-5">

          {/* Welcome card */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">Welcome, {displayName} 👋</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  You&apos;re part of making {wedding.couple_names}&apos;s day something beautiful.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Your RSVP</p>
                <button onClick={() => setShowRsvpEdit(v => !v)} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                  {currentRsvp === 'yes' ? 'Joining us ✨' : currentRsvp === 'maybe' ? 'Maybe 🤔' : currentRsvp === 'no' ? "Can't make it 😢" : 'Not set'} · Edit
                </button>
              </div>
            </div>
            {showRsvpEdit && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]/40 space-y-1.5">
                {([{ value: 'yes', label: "Yes, I'll be there! 🎉" }, { value: 'maybe', label: "Maybe, I'll let you know 🤔" }, { value: 'no', label: "Sorry, I can't make it 😢" }]).map(opt => (
                  <button key={opt.value} type="button" onClick={() => updateRsvp(opt.value)}
                    className={`w-full rounded-xl border-2 p-2.5 text-xs font-medium text-left transition-all ${currentRsvp === opt.value ? 'border-[var(--primary)] bg-[var(--secondary)]' : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/40'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* You're co-creating */}
          {myClaimedTasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                You&apos;re co-creating
              </h2>
              <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                {myClaimedTasks.map((task, i) => {
                  const cfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other
                  const CatIcon = cfg.Icon
                  return (
                    <div key={task.id} className={i > 0 ? 'border-t border-[var(--border)]/50' : ''}>
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                          <CatIcon className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{task.title}</p>
                          {task.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed line-clamp-1">{task.description}</p>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">co-creating</span>
                          <button onClick={() => openComments(task.id)} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                            View details →
                          </button>
                          <button onClick={() => unclaimTask(task)} className="text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                            Pass this on
                          </button>
                        </div>
                      </div>
                      {openCommentTaskId === task.id && (
                        <div className="px-4 pb-4 border-t border-[var(--border)]/40">{renderCommentThread(task.id)}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ways to co-create */}
          <div>
            <h2 className="font-semibold text-base mb-0.5">Ways to co-create</h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">Little ways you can help shape the day — pick one and make it yours.</p>
            {botanicalDivider}
            <div className="mt-3">
              {openTasks.length === 0 ? (
                <p className="text-sm text-center text-[var(--muted-foreground)] py-8">Every part of the day is beautifully in good hands.</p>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                    {visibleTasks.map((task, i) => {
                      const cfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other
                      const CatIcon = cfg.Icon
                      return (
                        <div key={task.id} className={i > 0 ? 'border-t border-[var(--border)]/50' : ''}>
                          <div className="px-4 py-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                              <CatIcon className="w-4.5 h-4.5" style={{ color: cfg.color, width: 18, height: 18 }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{task.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-medium" style={{ color: cfg.color }}>{CATEGORY_LABELS[task.category]}</span>
                              </div>
                              {task.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{task.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => openComments(task.id)}
                                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors flex items-center gap-0.5"
                                style={{ color: openCommentTaskId === task.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                                <MessageCircle className="w-4 h-4" />
                                {(taskComments[task.id]?.length || 0) > 0 && <span className="text-[10px]">{taskComments[task.id].length}</span>}
                              </button>
                              <Button size="sm" variant="outline"
                                className="text-xs h-8 px-4 font-medium"
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                onClick={() => claimTask(task)}>
                                Co-create
                              </Button>
                            </div>
                          </div>
                          {openCommentTaskId === task.id && (
                            <div className="px-4 pb-4 border-t border-[var(--border)]/40">{renderCommentThread(task.id)}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {openTasks.length > 3 && (
                    <button onClick={() => setShowAllTasks(v => !v)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      {showAllTasks ? 'Show fewer' : `Show ${openTasks.length - 3} more`}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllTasks ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Offer section */}
          <div className="pt-1 border-t border-[var(--border)]/50">
            <div className="flex items-start justify-between gap-3 mb-1 pt-4">
              <div>
                <h2 className="font-semibold text-base">Offer something of yours</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Got a skill, service or item that could help? Share it with the group.</p>
              </div>
              <Button size="sm" className="text-white shrink-0" style={{ backgroundColor: 'var(--primary)', border: 'none' }}
                onClick={() => setShowOfferForm(v => !v)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Make offer
              </Button>
            </div>

            {/* Category cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 mb-4">
              {([
                { Icon: Star, label: 'Skills & Services', desc: 'Photography, music, hair & more' },
                { Icon: Package, label: 'Items & Equipment', desc: 'Decor, furniture, lighting & more' },
                { Icon: Truck, label: 'Transport', desc: 'Rides, logistics, shuttles & more' },
                { Icon: UtensilsCrossed, label: 'Food & Drinks', desc: 'Catering, drinks, desserts & more' },
              ] as const).map(({ Icon, label, desc }) => (
                <button key={label} type="button" onClick={() => setShowOfferForm(true)}
                  className="bg-white rounded-xl border border-[var(--border)] p-3 text-center hover:border-[var(--primary)]/50 transition-colors">
                  <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: 'var(--primary)', opacity: 0.70 }} />
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#2d1f14' }}>{label}</p>
                  <p className="text-[10px] leading-relaxed" style={{ color: '#9a7a5a' }}>{desc}</p>
                </button>
              ))}
            </div>

            {/* Offer form */}
            {showOfferForm && (
              <form onSubmit={submitOffer} className="bg-white rounded-2xl border border-[var(--border)] p-4 space-y-3 mb-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="space-y-1">
                  <Label htmlFor="offer-title">What can you offer?</Label>
                  <Input id="offer-title" placeholder="e.g. I can do the wedding photography"
                    value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))} required
                    style={{ borderColor: '#e0cdb8', backgroundColor: '#fdf9f5' }} />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ALL_CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setOfferForm(f => ({ ...f, category: c }))}
                        className={`rounded-lg border px-2 py-2 text-xs text-center transition-all ${offerForm.category === c ? 'border-[var(--primary)] bg-[var(--secondary)] font-medium' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}>
                        {CATEGORY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="offer-desc">Details (optional)</Label>
                  <Textarea id="offer-desc" placeholder="Any extra info…" rows={2}
                    value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="text-white" disabled={offerLoading} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                    {offerLoading ? 'Sending…' : 'Send offer'}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowOfferForm(false)}>Cancel</Button>
                </div>
              </form>
            )}

            {offerSuccess && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 shrink-0" />
                Offer sent — the couple will be in touch!
              </div>
            )}

            {myOffers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-[var(--muted-foreground)]">What you&apos;ve offered</p>
                {myOffers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-xl border border-[var(--border)] p-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--secondary)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{offer.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[offer.category]}</p>
                    </div>
                    <span className="text-xs border rounded-full px-2 py-0.5 bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)]">Offered</span>
                  </div>
                ))}
              </div>
            ) : !showOfferForm && (
              <div className="bg-white rounded-xl border border-[var(--border)] p-5 text-center">
                <Gift className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--primary)', opacity: 0.40 }} />
                <p className="text-sm font-medium" style={{ color: '#2d1f14' }}>No offers yet</p>
                <p className="text-xs mt-0.5" style={{ color: '#9a7a5a' }}>Be the first to offer something to help make the day amazing.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--muted-foreground)]/70 border-t border-[var(--border)]">
            <Heart className="w-3 h-3" style={{ color: 'var(--primary)', opacity: 0.55 }} />
            Thank you to everyone already contributing. You&apos;re helping us create something unforgettable.
          </div>

        </main>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────── */}
        <aside className="hidden xl:flex w-72 shrink-0 sticky top-14 flex-col gap-4 p-5 border-l border-[var(--border)] overflow-y-auto"
          style={{ height: 'calc(100vh - 3.5rem)', backgroundColor: '#fdf8f3' }}>

          <h3 className="font-semibold text-sm" style={{ color: '#2d1f14' }}>A little inspiration</h3>

          {/* Card 1: photo + quote */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/table.png" alt="" className="w-full h-40 object-cover" />
            <div className="p-4 text-center">
              <p className="text-sm" style={{ fontFamily: 'Georgia, serif', color: '#2d1f14' }}>&ldquo;Many hands make</p>
              <p className="text-sm italic font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--primary)' }}>beautiful memories.&rdquo;</p>
              <Heart className="w-3 h-3 mx-auto mt-2" style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          {/* Card 2: handwritten-style quote */}
          <div className="rounded-2xl p-5 relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ background: '#fdf9f5', minHeight: '190px' }}>
            <p className="text-xl leading-snug relative z-10"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'var(--primary)', fontStyle: 'italic', fontWeight: 400 }}>
              The best weddings aren&apos;t perfect. They&apos;re personal.
            </p>
            <Heart className="w-3 h-3 mt-3 relative z-10" style={{ color: 'var(--primary)', opacity: 0.65 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/botanical-design.png" alt="" aria-hidden
              className="absolute -bottom-4 -right-4 w-32 pointer-events-none select-none"
              style={{ opacity: 0.35, mixBlendMode: 'multiply' }}
            />
          </div>

        </aside>

      </div>
    </div>
  )
}
