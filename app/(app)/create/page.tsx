'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CreateWeddingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    couple_names: '',
    name: '',
    date: '',
    venue: '',
    description: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('weddings')
      .insert({
        planner_id: user.id,
        couple_names: form.couple_names,
        name: form.name || `${form.couple_names}'s Wedding`,
        date: form.date || null,
        venue: form.venue || null,
        description: form.description || null,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/${data.id}`)
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] font-semibold text-lg">Wedify</Link>
          <h1 className="text-2xl font-bold mt-4 mb-1">Create your wedding</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            You can always update these details later from your dashboard.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="couple_names">Couple names <span className="text-red-400">*</span></Label>
              <Input
                id="couple_names"
                placeholder="e.g. Sarah & James"
                value={form.couple_names}
                onChange={e => set('couple_names', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g. Botanic Gardens"
                  value={form.venue}
                  onChange={e => set('venue', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">A little about your wedding</Label>
              <Textarea
                id="description"
                placeholder="Tell your guests what kind of day you're planning…"
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[#b8845b] text-white"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create wedding page →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
