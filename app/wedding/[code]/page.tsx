'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Wedding, Task, Offer, TaskComment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, Calendar, MapPin, Plus, Check, MessageCircle, Send } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  setup: '🔨 Setup', food: '🍽️ Food', music: '🎵 Music',
  photography: '📷 Photography', decor: '🌸 Decor', transport: '🚗 Transport',
  accommodation: '🏠 Accommodation', skill: '💡 Skill', equipment: '🔧 Equipment', other: '✨ Other',
}

const ALL_CATEGORIES = ['setup','food','music','photography','decor','transport','accommodation','skill','equipment','other'] as const

type Step = 'join' | 'rsvp' | 'main'

export default function GuestPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [step, setStep] = useState<Step>('join')
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Join form
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  // RSVP
  const [rsvp, setRsvp] = useState<'yes' | 'no' | 'maybe'>('yes')
  const [rsvpLoading, setRsvpLoading] = useState(false)

  // Comments
  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null)
  const [taskComments, setTaskComments] = useState<Record<string, TaskComment[]>>({})
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  // Offer form
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerForm, setOfferForm] = useState({ title: '', description: '', category: 'other' })
  const [offerLoading, setOfferLoading] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState(false)

  // RSVP editing
  const [currentRsvp, setCurrentRsvp] = useState<string>('pending')
  const [showRsvpEdit, setShowRsvpEdit] = useState(false)

  const loadWedding = useCallback(async () => {
    const { data } = await supabase
      .from('weddings')
      .select('*')
      .eq('invite_code', code)
      .single()

    if (!data) { setLoading(false); return }
    setWedding(data)

    // Check if already logged in + member
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      const { data: member } = await supabase
        .from('wedding_members')
        .select('*')
        .eq('wedding_id', data.id)
        .eq('user_id', user.id)
        .single()

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

    // Try sign in first, then sign up
    let uid = userId
    if (!uid) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const redirectTo = `${window.location.origin}/auth/callback?next=/wedding/${code}`
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo }
        })
        if (signUpError) { setJoinError(signUpError.message); setJoinLoading(false); return }

        // Email confirmation required — user needs to verify before joining
        if (!signUpData.user?.id) {
          setJoinError('Check your email for a confirmation link, then come back to this page to join.')
          setJoinLoading(false)
          return
        }

        uid = signUpData.user.id
      } else {
        uid = signInData.user?.id || null
      }
    }

    if (!uid) { setJoinError('Something went wrong — please try again.'); setJoinLoading(false); return }
    setUserId(uid)

    // Check already a member
    const { data: existing } = await supabase
      .from('wedding_members')
      .select('id, display_name')
      .eq('wedding_id', wedding.id)
      .eq('user_id', uid)
      .single()

    if (existing) {
      setMemberId(existing.id)
      setDisplayName(existing.display_name)
      await loadContent(wedding.id, uid)
      setStep('main')
      setJoinLoading(false)
      return
    }

    // Insert member
    const { data: member, error: memberError } = await supabase
      .from('wedding_members')
      .insert({ wedding_id: wedding.id, user_id: uid, display_name: displayName })
      .select()
      .single()

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
    setCurrentRsvp(rsvp)
    setStep('main')
    setRsvpLoading(false)
  }

  async function notify(type: string, message: string) {
    if (!wedding) return
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wedding_id: wedding.id, type, message }),
    }).catch(() => {}) // fire and forget
  }

  async function updateRsvp(newRsvp: string) {
    if (!memberId) return
    await supabase.from('wedding_members').update({ rsvp: newRsvp }).eq('id', memberId)
    setCurrentRsvp(newRsvp)
    setShowRsvpEdit(false)
  }

  async function unclaimTask(task: Task) {
    const { data } = await supabase
      .from('tasks')
      .update({ status: 'open', claimed_by: null, claimed_at: null })
      .eq('id', task.id)
      .select()
      .single()
    if (data) setTasks(t => t.map(tt => tt.id === task.id ? data : tt))
  }

  async function claimTask(task: Task) {
    if (!userId || !wedding) return
    const { data } = await supabase
      .from('tasks')
      .update({ status: 'claimed', claimed_by: userId, claimed_at: new Date().toISOString() })
      .eq('id', task.id)
      .select()
      .single()
    if (data) {
      setTasks(t => t.map(tt => tt.id === task.id ? data : tt))
      notify('task_claimed', `${displayName} is co-creating "${task.title}"`)
    }
  }

  async function openComments(taskId: string) {
    if (openCommentTaskId === taskId) { setOpenCommentTaskId(null); return }
    setCommentText('')
    setOpenCommentTaskId(taskId)
    if (!taskComments[taskId]) {
      const { data } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })
      setTaskComments(c => ({ ...c, [taskId]: data || [] }))
    }
  }

  async function submitComment(taskId: string) {
    if (!commentText.trim() || !userId) return
    setCommentLoading(true)
    const { data } = await supabase.from('task_comments').insert({
      task_id: taskId,
      wedding_id: wedding!.id,
      user_id: userId,
      display_name: displayName,
      message: commentText.trim(),
    }).select().single()
    if (data) {
      setTaskComments(c => ({ ...c, [taskId]: [...(c[taskId] || []), data] }))
      const task = tasks.find(t => t.id === taskId)
      notify('comment_posted', `${displayName} left a message on "${task?.title}"`)
    }
    setCommentText('')
    setCommentLoading(false)
  }

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault()
    if (!wedding || !userId || !offerForm.title.trim()) return
    setOfferLoading(true)
    const { data } = await supabase.from('offers').insert({
      wedding_id: wedding.id,
      user_id: userId,
      display_name: displayName,
      title: offerForm.title,
      description: offerForm.description || null,
      category: offerForm.category,
    }).select().single()
    if (data) {
      setMyOffers(o => [data, ...o])
      notify('offer_submitted', `${displayName} made an offer: "${offerForm.title}"`)
    }
    setOfferForm({ title: '', description: '', category: 'other' })
    setShowOfferForm(false)
    setOfferLoading(false)
    setOfferSuccess(true)
    setTimeout(() => setOfferSuccess(false), 3500)
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

  // ── JOIN STEP ──────────────────────────────────────────────
  if (step === 'join') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <img
              src="/assets/wax-seal.png"
              alt="Wedify"
              className="w-16 h-16 object-cover rounded-full mx-auto mb-3"
              style={{ boxShadow: '0 4px 16px rgba(180,130,60,0.3)' }}
            />
            <h1 className="text-xl font-bold">{wedding.couple_names}</h1>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">
              You&apos;ve been invited to co-create their wedding
            </p>
            {wedding.date && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(wedding.date).toLocaleDateString('en-AU', { dateStyle: 'long' })}
              </p>
            )}
            {wedding.venue && (
              <p className="text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {wedding.venue}
              </p>
            )}
            {wedding.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-3 bg-[var(--secondary)] rounded-xl px-4 py-3 text-left">
                {wedding.description}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <h2 className="font-semibold text-sm text-center">Join the celebration</h2>
            {/* Botanical divider — sprite row 2, col 2 */}
            <div className="flex justify-center my-1">
              <div style={{
                backgroundImage: 'url(/assets/dividers.png)',
                backgroundPosition: '100% 20%',
                backgroundSize: '200% 600%',
                backgroundRepeat: 'no-repeat',
                width: '200px',
                height: '44px',
                mixBlendMode: 'multiply',
              }} />
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Emma Williams"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create or enter existing password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <p className="text-xs text-[var(--muted-foreground)]">New here? We&apos;ll create your account automatically.</p>
              </div>
              {joinError && <p className="text-sm text-red-500">{joinError}</p>}
              <Button
                type="submit"
                className="w-full bg-[var(--primary)] hover:bg-[#b8845b] text-white"
                disabled={joinLoading}
              >
                {joinLoading ? 'Joining…' : 'Join the wedding →'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── RSVP STEP ─────────────────────────────────────────────
  if (step === 'rsvp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--secondary)] mb-3">
              <Heart className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-bold">Hey {displayName}! 👋</h2>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">Will you be joining {wedding.couple_names}?</p>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm space-y-3">
            {[
              { value: 'yes', label: "Yes, I'll be there! 🎉" },
              { value: 'maybe', label: "Maybe, I'll let you know 🤔" },
              { value: 'no', label: "Sorry, I can't make it 😢" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRsvp(opt.value as 'yes' | 'no' | 'maybe')}
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                  rsvp === opt.value
                    ? 'border-[var(--primary)] bg-[var(--secondary)] text-[var(--foreground)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <Button
              className="w-full bg-[var(--primary)] hover:bg-[#b8845b] text-white mt-2"
              onClick={handleRsvp}
              disabled={rsvpLoading}
            >
              {rsvpLoading ? 'Saving…' : 'Confirm RSVP →'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN GUEST VIEW ────────────────────────────────────────
  const openTasks = tasks.filter(t => t.status === 'open')
  const myClaimedTasks = tasks.filter(t => t.claimed_by === userId)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm">{wedding.couple_names}</span>
            {wedding.date && (
              <span className="text-xs text-[var(--muted-foreground)] ml-2">
                · {new Date(wedding.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <span className="text-[var(--primary)] font-semibold text-sm">Wedify</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="bg-[var(--secondary)] rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Welcome, {displayName} 🤍</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                You&apos;re part of making {wedding.couple_names}&apos;s day something beautiful.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Your RSVP</p>
              <button
                onClick={() => setShowRsvpEdit(v => !v)}
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                {currentRsvp === 'yes' ? "Joining us ✨" : currentRsvp === 'maybe' ? "Maybe 🤔" : currentRsvp === 'no' ? "Can't make it 😢" : "Not set"} · Edit
              </button>
            </div>
          </div>
          {showRsvpEdit && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]/40 space-y-1.5">
              {[
                { value: 'yes',   label: "Yes, I'll be there! 🎉" },
                { value: 'maybe', label: "Maybe, I'll let you know 🤔" },
                { value: 'no',    label: "Sorry, I can't make it 😢" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRsvp(opt.value)}
                  className={`w-full rounded-xl border-2 p-2.5 text-xs font-medium text-left transition-all ${
                    currentRsvp === opt.value
                      ? 'border-[var(--primary)] bg-white'
                      : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My claimed tasks */}
        {myClaimedTasks.length > 0 && (
          <div>
            <h2 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              ✨ You&apos;re co-creating
            </h2>
            <div className="space-y-2">
              {myClaimedTasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-[var(--border)] p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.description && <p className="text-xs text-[var(--muted-foreground)]">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">co-creating</span>
                    <button
                      onClick={() => unclaimTask(task)}
                      className="text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      Pass this on
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botanical divider — sprite row 1, col 1 */}
        <div className="flex justify-center -my-1">
          <div style={{
            backgroundImage: 'url(/assets/dividers.png)',
            backgroundPosition: '0% 0%',
            backgroundSize: '200% 600%',
            backgroundRepeat: 'no-repeat',
            width: '260px',
            height: '58px',
            mixBlendMode: 'multiply',
          }} />
        </div>

        {/* Available tasks */}
        <div>
          <h2 className="font-semibold text-sm mb-0.5">Ways to co-create</h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">Little ways you can help shape the day — pick one and make it yours.</p>
          {openTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">Everything&apos;s beautifully covered.</p>
              <p className="text-xs text-[var(--muted-foreground)]">Every part of the day is beautifully in good hands.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openTasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[task.category]}</p>
                      {task.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openComments(task.id)}
                        className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors p-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {(taskComments[task.id]?.length || 0) > 0 && (
                          <span>{taskComments[task.id].length}</span>
                        )}
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--secondary)] text-xs whitespace-nowrap"
                        onClick={() => claimTask(task)}
                      >
                        Co-create
                      </Button>
                    </div>
                  </div>

                  {/* Comment thread */}
                  {openCommentTaskId === task.id && (
                    <div className="border-t border-[var(--border)] bg-[var(--secondary)]/40 px-3 py-3 space-y-2">
                      {(taskComments[task.id] || []).length === 0 && (
                        <p className="text-xs text-[var(--muted-foreground)] text-center py-1">No messages yet — ask a question or leave a note.</p>
                      )}
                      {(taskComments[task.id] || []).map(comment => (
                        <div key={comment.id} className={`flex gap-2 ${comment.user_id === userId ? 'flex-row-reverse' : ''}`}>
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-semibold text-[var(--primary)] shrink-0">
                            {comment.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`max-w-[75%] ${comment.user_id === userId ? 'items-end' : 'items-start'} flex flex-col`}>
                            <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{comment.display_name}</p>
                            <div className={`rounded-xl px-3 py-1.5 text-xs ${comment.user_id === userId ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>
                              {comment.message}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Ask a question or leave a note…"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(task.id) } }}
                          className="flex-1 text-xs rounded-lg border border-[var(--border)] px-3 py-1.5 bg-white focus:outline-none focus:border-[var(--primary)]"
                        />
                        <button
                          onClick={() => submitComment(task.id)}
                          disabled={commentLoading || !commentText.trim()}
                          className="p-1.5 rounded-lg bg-[var(--primary)] text-white disabled:opacity-40 hover:bg-[#b8845b] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botanical divider — sprite row 1, col 1 */}
        <div className="flex justify-center -my-1">
          <div style={{
            backgroundImage: 'url(/assets/dividers.png)',
            backgroundPosition: '0% 0%',
            backgroundSize: '200% 600%',
            backgroundRepeat: 'no-repeat',
            width: '260px',
            height: '58px',
            mixBlendMode: 'multiply',
          }} />
        </div>

        {/* Make an offer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm">Offer something of yours</h2>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-[var(--border)]"
              onClick={() => setShowOfferForm(v => !v)}
            >
              <Plus className="w-3 h-3 mr-1" /> Make offer
            </Button>
          </div>

          {showOfferForm && (
            <form onSubmit={submitOffer} className="bg-white rounded-xl border border-[var(--border)] p-4 space-y-3 mb-3">
              <div className="space-y-1">
                <Label htmlFor="offer-title">What can you offer?</Label>
                <Input
                  id="offer-title"
                  placeholder="e.g. I can do the wedding photography"
                  value={offerForm.title}
                  onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOfferForm(f => ({ ...f, category: c }))}
                      className={`rounded-lg border px-2 py-2 text-xs text-center transition-all ${
                        offerForm.category === c
                          ? 'border-[var(--primary)] bg-[var(--secondary)] font-medium'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="offer-desc">Details (optional)</Label>
                <Textarea
                  id="offer-desc"
                  placeholder="Any extra info…"
                  rows={2}
                  value={offerForm.description}
                  onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white" disabled={offerLoading}>
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

          {myOffers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--muted-foreground)]">What you&apos;ve offered the couple</p>
              {myOffers.map(offer => (
                <div key={offer.id} className="bg-white rounded-xl border border-[var(--border)] p-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--secondary)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{offer.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[offer.category]}</p>
                  </div>
                  <span className="text-xs border rounded-full px-2 py-0.5 bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)]">
                    Offered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
