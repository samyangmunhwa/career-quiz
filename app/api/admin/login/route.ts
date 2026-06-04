import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSession, clearSession, isAuthed } from '@/lib/auth';

// 현재 세션 상태 확인 (페이지 새로고침 시 로그인 유지용)
export async function GET() {
  return NextResponse.json({ authed: await isAuthed('admin') });
}

// 로그인: 비밀번호를 서버에서 검증 → 성공 시 httpOnly 쿠키 발급
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (!checkPassword(password ?? '', 'admin')) {
    return NextResponse.json({ error: '관리자 비밀번호가 틀렸습니다' }, { status: 401 });
  }
  await createSession('admin');
  return NextResponse.json({ ok: true });
}

// 로그아웃: 쿠키 제거
export async function DELETE() {
  await clearSession('admin');
  return NextResponse.json({ ok: true });
}
