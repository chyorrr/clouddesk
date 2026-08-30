import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({}, { status: 401 })

  const { data } = await supabase
    .from('desktop_icon_positions')
    .select('icon_key, x, y')
    .eq('user_id', user.id)

  const positions: Record<string, { x: number; y: number }> = {}
  for (const row of data || []) {
    positions[row.icon_key] = { x: row.x, y: row.y }
  }

  return NextResponse.json(positions)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { iconKey, x, y } = await request.json()

  const { error } = await supabase
    .from('desktop_icon_positions')
    .upsert({
      user_id: user.id,
      icon_key: iconKey,
      x,
      y,
    }, { onConflict: 'user_id,icon_key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
