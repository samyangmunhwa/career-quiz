import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSession, clearSession, isAuthed } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ authed: await isAuthed('super') });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (!checkPassword(password ?? '', 'super')) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다' }, { status: 401 });
  }
  await createSession('super');
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSession('super');
  return NextResponse.json({ ok: true });
}
