'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import type { Wedding, Task, Offer, WeddingMember, TaskComment, AppNotification } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, ClipboardList, Gift, Copy, Check, Plus, Calendar, MapPin, Pencil, Trash2, MessageCircle, Send, Bell, X, Heart, ChevronDown } from 'lucide-react'
import QRCodeDisplay from '@/components/wedding/QRCodeDisplay'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] })

const CATEGORIES = ['setup','food','music','photography','decor','transport','accommodation','other'] as const

const CATEGORY_LABELS: Record<string, string> = {
  setup: '🔨 Setup', food: '🍽️ Food', music: '🎵 Music',
  photography: '📷 Photography', decor: '🌸 Decor', transport: '🚗 Transport',
  accommodation: '🏠 Accommodation', skill: '💡 Skill', equipment: '🔧 Equipment', other: '✨ Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  setup: '#fce8e8', food: '#fef3e2', music: '#ede8f8',
  photography: '#e8f0fe', decor: '#fce8f0', transport: '#e2f4e8',
  accommodation: '#e8f6f4', skill: '#fef9e8', equipment: '#f4ede8', other: '#f5f0eb',
}

const NAB_TAB_CLS = 'h-full px-3 sm:px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[var(--muted-foreground)] flex items-center gap-1.5 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0'

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [members, setMembers] = useState<WeddingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [showDeclined, setShowDeclined] = useState(false)
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', category: 'other' })
  const [taskLoading, setTaskLoading] = useState(false)

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'other' })
  const [editLoading, setEditLoading] = useState(false)

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null)
  const [taskComments, setTaskComments] = useState<Record<string, TaskComment[]>>({})
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/wedding/${wedding?.invite_code}`
    : ''

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [weddingRes, tasksRes, offersRes, membersRes, notificationsRes] = await Promise.all([
      supabase.from('weddings').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('wedding_id', id).order('created_at', { ascending: false }),
      supabase.from('offers').select('*').eq('wedding_id', id).order('created_at', { ascending: false }),
      supabase.from('wedding_members').select('*').eq('wedding_id', id).order('created_at'),
      supabase.from('notifications').select('*').eq('wedding_id', id).order('created_at', { ascending: false }).limit(30),
    ])

    if (weddingRes.error || !weddingRes.data) { router.push('/create'); return }
    if (weddingRes.data.planner_id !== user.id) { router.push('/'); return }

    setWedding(weddingRes.data)
    setTasks(tasksRes.data || [])
    setOffers(offersRes.data || [])
    setMembers(membersRes.data || [])
    setNotifications(notificationsRes.data || [])
    setLoading(false)
  }, [id, router, supabase])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`notifications:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `wedding_id=eq.${id}` },
        (payload) => { setNotifications(n => [payload.new as AppNotification, ...n]) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, supabase])

  useEffect(() => {
    if (!showNotifications) return
    const fn = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showNotifications])

  useEffect(() => {
    if (!showUserMenu) return
    const fn = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showUserMenu])

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('wedding_id', id).eq('read', false)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    setTaskLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('tasks').insert({
      wedding_id: id, created_by: user?.id,
      title: taskForm.title, description: taskForm.description || null, category: taskForm.category,
    }).select().single()
    if (data) setTasks(t => [data, ...t])
    setTaskForm({ title: '', description: '', category: 'other' })
    setShowTaskForm(false)
    setTaskLoading(false)
  }

  function openEditTask(task: Task) {
    setEditingTask(task)
    setEditForm({ title: task.title, description: task.description || '', category: task.category })
  }

  async function saveEditTask(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTask || !editForm.title.trim()) return
    setEditLoading(true)
    await supabase.from('tasks').update({
      title: editForm.title, description: editForm.description || null, category: editForm.category,
    }).eq('id', editingTask.id)
    setTasks(t => t.map(task => task.id === editingTask.id
      ? { ...task, title: editForm.title, description: editForm.description || null, category: editForm.category as Task['category'] }
      : task))
    setEditingTask(null)
    setEditLoading(false)
  }

  async function deleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(t => t.filter(task => task.id !== taskId))
    setDeletingTaskId(null)
  }

  async function openComments(taskId: string) {
    if (openCommentTaskId === taskId) { setOpenCommentTaskId(null); return }
    setCommentText('')
    setOpenCommentTaskId(taskId)
    if (!taskComments[taskId]) {
      const { data } = await supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
      setTaskComments(c => ({ ...c, [taskId]: data || [] }))
    }
  }

  async function submitComment(taskId: string) {
    if (!commentText.trim()) return
    setCommentLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('task_comments').insert({
      task_id: taskId, wedding_id: id, user_id: user!.id,
      display_name: wedding!.couple_names, message: commentText.trim(),
    }).select().single()
    if (data) setTaskComments(c => ({ ...c, [taskId]: [...(c[taskId] || []), data] }))
    setCommentText('')
    setCommentLoading(false)
  }

  async function updateMemberRsvp(memberId: string, rsvp: string) {
    await supabase.from('wedding_members').update({ rsvp }).eq('id', memberId)
    setMembers(m => m.map(mem => mem.id === memberId ? { ...mem, rsvp: rsvp as WeddingMember['rsvp'] } : mem))
    setEditingRsvpId(null)
  }

  async function updateOfferStatus(offerId: string, status: 'accepted' | 'declined') {
    await supabase.from('offers').update({ status }).eq('id', offerId)
    setOffers(o => o.map(offer => offer.id === offerId ? { ...offer, status } : offer))
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading your wedding…</p>
        </div>
      </div>
    )
  }

  if (!wedding) return null

  const openTaskCount = tasks.filter(t => t.status === 'open').length
  const allocatedCount = tasks.filter(t => t.status !== 'open').length
  const pendingOffersCount = offers.filter(o => o.status === 'pending').length
  const rsvpYesCount = members.filter(m => m.rsvp === 'yes').length
  const unreadCount = notifications.filter(n => !n.read).length

  const initials = wedding.couple_names
    .split(/\s*&\s*|\s+and\s+/i)
    .filter(Boolean)
    .map(n => n.trim()[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)

  const categoryPicker = (val: string, set: (v: string) => void) => (
    <div className="grid grid-cols-4 gap-1.5">
      {CATEGORIES.map(c => (
        <button key={c} type="button" onClick={() => set(c)}
          className={`rounded-lg border px-2 py-2 text-xs text-center transition-all ${val === c ? 'border-[var(--primary)] bg-[var(--secondary)] font-medium' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}>
          {CATEGORY_LABELS[c]}
        </button>
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="tasks" onValueChange={setActiveTab} className="min-h-screen flex flex-col">

      {/* ── DIALOGS ─────────────────────────────────────────── */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Co-create</DialogTitle></DialogHeader>
          <form onSubmit={addTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">What&apos;s needed</Label>
              <Input id="task-title" placeholder="e.g. Set up the flower arch" value={taskForm.title}
                onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              {categoryPicker(taskForm.category, v => setTaskForm(f => ({ ...f, category: v })))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Details (optional)</Label>
              <Textarea id="task-desc" placeholder="Any extra info guests should know…" rows={3}
                value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowTaskForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white" disabled={taskLoading}>
                {taskLoading ? 'Adding…' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTask} onOpenChange={open => { if (!open) setEditingTask(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit co-creation</DialogTitle></DialogHeader>
          <form onSubmit={saveEditTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              {categoryPicker(editForm.category, v => setEditForm(f => ({ ...f, category: v })))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Details (optional)</Label>
              <Textarea id="edit-desc" rows={3} value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>Cancel</Button>
              <Button type="submit" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white" disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTaskId} onOpenChange={open => { if (!open) setDeletingTaskId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove this co-creation?</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--muted-foreground)]">
            {tasks.find(t => t.id === deletingTaskId) && (
              <><strong>&ldquo;{tasks.find(t => t.id === deletingTaskId)!.title}&rdquo;</strong> will be permanently removed. </>
            )}
            This can&apos;t be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingTaskId(null)}>Cancel</Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => deletingTaskId && deleteTask(deletingTaskId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 flex items-stretch h-14">
          <Link href="/" className={`${playfair.className} text-lg text-[var(--primary)] flex items-center shrink-0 mr-4 sm:mr-6`}>
            Wedify
          </Link>

          <TabsList className="flex-1 h-full bg-transparent p-0 rounded-none justify-start overflow-x-auto gap-0">
            <TabsTrigger value="tasks" className={NAB_TAB_CLS}>
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>Co-creations</span>
              {openTaskCount > 0 && <span className="bg-[var(--primary)] text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center leading-none">{openTaskCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="offers" className={NAB_TAB_CLS}>
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>Offers</span>
              {pendingOffersCount > 0 && <span className="bg-[var(--primary)] text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center leading-none">{pendingOffersCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="guests" className={NAB_TAB_CLS}>
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Guests</span>
              {members.length > 0 && <span className="text-[10px] text-[var(--muted-foreground)]">({members.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="allocated" className={NAB_TAB_CLS}>
              <Heart className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">In good hands</span>
              <span className="sm:hidden">In hands</span>
              {allocatedCount > 0 && <span className="bg-green-600 text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center leading-none">{allocatedCount}</span>}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(v => !v); if (!showNotifications) markAllRead() }}
                className="relative p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <Bell className="w-4 h-4 text-[var(--muted-foreground)]" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 w-72 bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
                    <p className="text-xs font-semibold">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-[var(--muted-foreground)] p-0.5 rounded hover:text-[var(--foreground)]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="text-xs text-[var(--muted-foreground)] text-center py-6">No notifications yet</p>
                      : notifications.map(notif => (
                        <div key={notif.id} className={`px-4 py-3 border-b border-[var(--border)] last:border-0 ${!notif.read ? 'bg-[var(--secondary)]/50' : ''}`}>
                          <p className="text-xs leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                            {new Date(notif.created_at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)]">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 w-36 bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50 py-1">
                  <button
                    onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <aside
          className="hidden lg:flex w-56 shrink-0 flex-col sticky top-14 overflow-y-auto border-r border-[var(--border)]"
          style={{ height: 'calc(100vh - 3.5rem)', backgroundColor: '#fdf8f3' }}
        >
          {/* Brand block */}
          <div className="px-5 pt-7 pb-3 text-center">
            <p className={`${playfair.className} text-xl font-bold`} style={{ color: 'var(--primary)' }}>
              Wedify
            </p>
            <p className="text-xs italic mt-1.5 leading-relaxed" style={{ color: 'var(--primary)', opacity: 0.75 }}>
              Building beautiful<br />memories together
            </p>
            <Heart className="w-3 h-3 mx-auto mt-3" style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>

          {/* Botanical divider */}
          <div className="mx-auto mb-4" style={{
            backgroundImage: 'url(/assets/dividers.png)',
            backgroundPosition: '100% 0%',
            backgroundSize: '200% 600%',
            backgroundRepeat: 'no-repeat',
            width: '140px',
            height: '32px',
            mixBlendMode: 'multiply',
            opacity: 0.55,
          }} />

          {/* Photo stack */}
          <div className="flex flex-col items-center gap-2 px-4 pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/table.png" alt="" aria-hidden
              className="w-[150px] h-[95px] rounded object-cover select-none pointer-events-none"
              style={{ transform: 'rotate(-5deg)', boxShadow: '0 4px 12px rgba(80,50,20,0.22)' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/polaroid-laugh.png" alt="" aria-hidden
              className="w-[138px] select-none pointer-events-none"
              style={{ transform: 'rotate(4deg)', filter: 'drop-shadow(0 6px 16px rgba(80,50,20,0.25))', marginTop: '-6px' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/botanical-design.png" alt="" aria-hidden
              className="w-[86px] select-none pointer-events-none"
              style={{ transform: 'rotate(-3deg)', opacity: 0.85, mixBlendMode: 'multiply', marginTop: '-4px' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/wax-seal.png" alt="" aria-hidden
              className="w-11 h-11 rounded-full object-cover select-none pointer-events-none"
              style={{ boxShadow: '0 3px 12px rgba(160,114,72,0.28)', marginTop: '8px' }}
            />
          </div>
        </aside>

        {/* ── CENTER ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/background.png" alt="" aria-hidden
          className="absolute top-0 right-0 h-full w-3/5 object-cover object-center pointer-events-none select-none"
          style={{ opacity: 0.3 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--background) 12%, rgba(250,249,247,0.82) 38%, transparent 62%)' }} />

        <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className={`${playfair.className} text-4xl sm:text-5xl font-bold mb-2`}>{wedding.couple_names}</h1>
          <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-3 flex-wrap mb-6">
            {wedding.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(wedding.date).toLocaleDateString('en-AU', { dateStyle: 'long' })}
              </span>
            )}
            {wedding.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {wedding.venue}
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Attending', value: rsvpYesCount, sub: 'guests', icon: Users },
              { label: 'Needed', value: openTaskCount, sub: 'co-creations', icon: ClipboardList },
              { label: 'In good hands', value: allocatedCount, sub: 'co-creations', icon: Check },
              { label: 'Offers', value: pendingOffersCount, sub: 'to review', icon: Gift },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="bg-white/80 backdrop-blur rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-xs mb-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
                </div>
                <div className="text-3xl font-bold leading-none">{value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-7 items-start">

          {/* LEFT */}
          <div className="space-y-4 min-w-0">

            {/* Invitation card */}
            <div className="relative rounded-2xl border border-[var(--border)] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fdf8f2 0%, #f2e4d0 100%)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/botanical-design.png" alt="" aria-hidden
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[130%] w-auto max-w-[220px] pointer-events-none select-none"
                style={{ opacity: 0.55, mixBlendMode: 'multiply' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/wax-seal.png" alt="" aria-hidden
                className="absolute right-6 bottom-5 w-20 pointer-events-none select-none"
                style={{ opacity: 0.9 }} />

              <div className="relative px-10 py-8 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
                  Your Wedding Invitation
                </p>
                <h2 className={`${playfair.className} text-3xl font-bold mb-2`}>Co-create with us</h2>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-14" style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,108,0.5))' }} />
                  <span style={{ color: 'rgba(201,149,108,0.7)', fontSize: '15px' }}>❦</span>
                  <div className="h-px w-14" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,108,0.5))' }} />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Share with everyone you love and let them be part of the day.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                  <Button size="sm" onClick={copyInviteLink}
                    className={`h-9 px-5 transition-all ${copied ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-[var(--primary)] hover:bg-[#b8845b] text-white'}`}>
                    {copied
                      ? <><Check className="w-3.5 h-3.5 mr-1.5" />Copied</>
                      : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy invitation link</>}
                  </Button>
                  <QRCodeDisplay url={inviteUrl} />
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)]/60 italic">
                  Your guests can join, co-create, and offer their talents — all in one place.
                </p>
              </div>
            </div>

            {/* Tab action row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <h2 className="font-semibold text-base text-[var(--foreground)]">
                {activeTab === 'tasks' && 'Ways to co-create'}
                {activeTab === 'offers' && 'Thoughtful contributions'}
                {activeTab === 'guests' && 'Your celebration'}
                {activeTab === 'allocated' && 'Everything in good hands'}
              </h2>
              {activeTab === 'tasks' && (
                <Button size="sm" className="bg-[var(--primary)] hover:bg-[#b8845b] text-white shrink-0"
                  onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Co-create
                </Button>
              )}
            </div>

            {/* TASKS */}
            <TabsContent value="tasks" className="mt-0 space-y-2.5">
              {tasks.filter(t => t.status === 'open').length === 0 && (
                <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
                  {tasks.length === 0
                    ? 'Nothing here yet — add something your guests can help bring to life.'
                    : 'All beautifully in good hands.'}
                </div>
              )}
              {tasks.filter(t => t.status === 'open').map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background: CATEGORY_COLORS[task.category] }}>
                      {CATEGORY_LABELS[task.category]?.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {CATEGORY_LABELS[task.category]?.split(' ').slice(1).join(' ')}
                      </p>
                      {task.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => openComments(task.id)}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {(taskComments[task.id]?.length || 0) > 0 && <span className="text-xs">{taskComments[task.id].length}</span>}
                      </button>
                      <span className="text-xs border rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-700 border-amber-200 font-medium">Needed</span>
                      <button onClick={() => openEditTask(task)} className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingTaskId(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {openCommentTaskId === task.id && (
                    <div className="border-t border-[var(--border)] bg-[var(--secondary)]/40 px-4 py-3 space-y-2">
                      {(taskComments[task.id] || []).length === 0 && (
                        <p className="text-xs text-[var(--muted-foreground)] text-center py-1">No messages yet.</p>
                      )}
                      {(taskComments[task.id] || []).map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-semibold text-[var(--primary)] shrink-0">
                            {comment.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{comment.display_name}</p>
                            <div className="rounded-xl px-3 py-1.5 text-xs bg-white border border-[var(--border)]">{comment.message}</div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input type="text" placeholder="Reply to guests…" value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitComment(task.id) } }}
                          className="flex-1 text-xs rounded-lg border border-[var(--border)] px-3 py-1.5 bg-white focus:outline-none focus:border-[var(--primary)]" />
                        <button onClick={() => submitComment(task.id)} disabled={commentLoading || !commentText.trim()}
                          className="p-1.5 rounded-lg bg-[var(--primary)] text-white disabled:opacity-40 hover:bg-[#b8845b] transition-colors">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* OFFERS */}
            <TabsContent value="offers" className="mt-0 space-y-2.5">
              {offers.filter(o => o.status === 'pending').length === 0 && (
                <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
                  {offers.length === 0 ? 'No offers yet — once guests start contributing, they\'ll appear here.' : 'All reviewed.'}
                </div>
              )}
              {offers.filter(o => o.status === 'pending').map(offer => (
                <div key={offer.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm">{offer.title}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[offer.category]}</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">from {offer.display_name}</p>
                    {offer.description && <p className="text-sm text-[var(--muted-foreground)]">{offer.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-7 text-green-700 border-green-200 hover:bg-green-50"
                      onClick={() => updateOfferStatus(offer.id, 'accepted')}>Accept</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => updateOfferStatus(offer.id, 'declined')}>Decline</Button>
                  </div>
                </div>
              ))}
              {offers.filter(o => o.status === 'declined').length > 0 && (
                <div className="pt-1">
                  <button type="button" onClick={() => setShowDeclined(v => !v)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {showDeclined ? '▾' : '▸'} Show declined ({offers.filter(o => o.status === 'declined').length})
                  </button>
                  {showDeclined && (
                    <div className="space-y-2 mt-2">
                      {offers.filter(o => o.status === 'declined').map(offer => (
                        <div key={offer.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60">
                          <p className="font-semibold text-sm">{offer.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[offer.category]} · from {offer.display_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* GUESTS */}
            <TabsContent value="guests" className="mt-0 space-y-2.5">
              {members.length === 0 && (
                <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
                  No one&apos;s joined yet — share your invite link or QR code and watch your people arrive.
                </div>
              )}
              {members.map(member => (
                <div key={member.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center text-sm font-semibold text-[var(--primary)] shrink-0">
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{member.display_name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Joined {new Date(member.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  {editingRsvpId === member.id ? (
                    <select autoFocus value={member.rsvp} onChange={e => updateMemberRsvp(member.id, e.target.value)}
                      onBlur={() => setEditingRsvpId(null)}
                      className="text-xs border border-[var(--primary)] rounded-lg px-2 py-1 bg-white focus:outline-none">
                      <option value="yes">Joining us ✨</option>
                      <option value="maybe">Maybe</option>
                      <option value="no">With you in spirit</option>
                      <option value="pending">No RSVP</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs border rounded-full px-2 py-0.5 ${
                        member.rsvp === 'yes' ? 'bg-green-50 text-green-700 border-green-200'
                        : member.rsvp === 'maybe' ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : member.rsvp === 'no' ? 'bg-purple-50 text-purple-600 border-purple-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {member.rsvp === 'pending' ? 'No RSVP' : member.rsvp === 'yes' ? 'Joining us ✨' : member.rsvp === 'maybe' ? 'Maybe' : 'With you in spirit'}
                      </span>
                      <button onClick={() => setEditingRsvpId(member.id)} className="p-1 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* ALLOCATED */}
            <TabsContent value="allocated" className="mt-0 space-y-2.5">
              {tasks.filter(t => t.status !== 'open').length === 0 && offers.filter(o => o.status === 'accepted').length === 0 && (
                <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
                  Nothing&apos;s been taken on yet — guests can step in from your invite page.
                </div>
              )}
              {tasks.filter(t => t.status !== 'open').map(task => {
                const claimer = task.claimed_by ? members.find(m => m.user_id === task.claimed_by) : null
                return (
                  <div key={task.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background: CATEGORY_COLORS[task.category] }}>
                      {CATEGORY_LABELS[task.category]?.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[task.category]?.split(' ').slice(1).join(' ')}</p>
                      {claimer && <p className="text-xs font-medium text-[var(--primary)] mt-0.5">👤 {claimer.display_name}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs border rounded-full px-2.5 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium">In good hands</span>
                      <button onClick={() => openEditTask(task)} className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingTaskId(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {offers.filter(o => o.status === 'accepted').map(offer => (
                <div key={offer.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: CATEGORY_COLORS[offer.category] }}>
                    {CATEGORY_LABELS[offer.category]?.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{offer.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[offer.category]?.split(' ').slice(1).join(' ')}</p>
                    <p className="text-xs font-medium text-[var(--primary)] mt-0.5">🎁 {offer.display_name}</p>
                  </div>
                  <span className="text-xs border rounded-full px-2.5 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium shrink-0">In good hands</span>
                </div>
              ))}
            </TabsContent>

            {/* Thank you */}
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--muted-foreground)]/70 border-t border-[var(--border)]">
              <Heart className="w-3 h-3 text-[var(--primary)]/60" />
              Thank you to everyone already contributing. You&apos;re helping us create something unforgettable.
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:flex flex-col gap-5">

            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
              <h3 className="font-semibold text-sm mb-3">Quick summary</h3>
              <div className="space-y-3">
                {[
                  { icon: ClipboardList, label: 'Needed', value: openTaskCount, sub: 'co-creations' },
                  { icon: Check, label: 'In good hands', value: allocatedCount, sub: 'co-creations' },
                  { icon: Gift, label: 'Offers', value: pendingOffersCount, sub: 'to review' },
                  { icon: Users, label: 'Guests', value: rsvpYesCount, sub: 'attending' },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[var(--secondary)] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs text-[var(--muted-foreground)] ml-1">{sub}</span>
                    </div>
                    <span className="text-lg font-bold">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowNotifications(true); markAllRead() }}
                className="mt-4 text-xs text-[var(--primary)] hover:underline">
                View all activity →
              </button>
            </div>

            <div className="rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden" style={{ background: '#fdf9f5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/table.png" alt="" className="w-full h-40 object-cover" />
              <div className="p-4 text-center">
                <p className="text-sm text-[var(--foreground)]">&ldquo;Many hands make</p>
                <p className={`${playfair.className} text-sm italic font-bold`} style={{ color: 'var(--primary)' }}>
                  beautiful memories.&rdquo;
                </p>
                <Heart className="w-3 h-3 text-[var(--primary)] mx-auto mt-2" />
              </div>
            </div>

          </div>
        </div>
      </main>
        </div>
      </div>
    </Tabs>
  )
}
