import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { wedding_id, type, message } = await request.json()
    if (!wedding_id || !type || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Service role client — server only, never exposed to browser
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get wedding + planner details
    const { data: wedding } = await supabase
      .from('weddings')
      .select('planner_id, couple_names')
      .eq('id', wedding_id)
      .single()

    if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

    // Insert notification row
    await supabase.from('notifications').insert({ wedding_id, type, message })

    // Get planner email
    const { data: { user } } = await supabase.auth.admin.getUserById(wedding.planner_id)

    if (user?.email) {
      await resend.emails.send({
        from: 'Wedify <onboarding@resend.dev>',
        to: user.email,
        subject: `New activity on ${wedding.couple_names}'s wedding`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 480px; margin: 40px auto; padding: 32px; border: 1px solid #e8d5c0; border-radius: 12px; background: #fdf8f3;">
            <p style="color: #c9956c; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 8px;">Wedify</p>
            <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px;">${wedding.couple_names}</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">${message}</p>
            <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? `${request.headers.get('origin')}/dashboard` : '#'}"
              style="display: inline-block; background: #c9956c; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px;">
              View dashboard →
            </a>
            <p style="color: #aaa; font-size: 11px; margin: 24px 0 0;">You're receiving this because you're planning a wedding on Wedify.</p>
          </div>
        `
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
