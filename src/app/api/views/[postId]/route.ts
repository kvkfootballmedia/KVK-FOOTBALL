import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const seen = new Map<string, number>();
const COOLDOWN_MS = 10 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  if (!postId) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  const key = `${ip}:${postId}`;
  const last = seen.get(key) ?? 0;

  if (Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  seen.set(key, Date.now());

  if (seen.size > 20_000) {
    const cutoff = Date.now() - COOLDOWN_MS;
    for (const [k, ts] of seen) if (ts < cutoff) seen.delete(k);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase.from('post_views').insert({ post_id: postId });

  return NextResponse.json({ ok: true });
}
