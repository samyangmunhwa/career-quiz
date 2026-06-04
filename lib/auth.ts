import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// ⚠️ 모든 비밀번호/시크릿은 서버 전용 환경변수에서만 읽습니다.
//    절대 NEXT_PUBLIC_ 으로 노출하지 마세요. (그러면 다시 1·2번 문제 재발)
const SECRET = process.env.ADMIN_SESSION_SECRET || '';

export type Role = 'admin' | 'super';

const COOKIE_NAME: Record<Role, string> = {
  admin: 'sy_admin',
  super: 'sy_super',
};

const MAX_AGE = 60 * 60 * 12; // 세션 유효시간 12시간(초)

// 타이밍 공격 방지용 상수시간 문자열 비교
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// 환경변수의 정답 비밀번호와 입력값을 안전하게 비교
export function checkPassword(input: string, role: Role): boolean {
  const expected =
    role === 'admin'
      ? process.env.ADMIN_PASSWORD
      : process.env.SUPERADMIN_PASSWORD;
  if (!expected) return false; // 환경변수 미설정 시 무조건 거부
  return safeEqual(input || '', expected);
}

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('hex');
}

// "role.만료시각" 을 서명한 토큰 발급
function makeToken(role: Role): string {
  const payload = `${role}.${Date.now() + MAX_AGE * 1000}`;
  const sig = sign(payload);
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

function verifyToken(token: string | undefined, role: Role): boolean {
  if (!token || !SECRET) return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;

  const payload = Buffer.from(b64, 'base64url').toString();
  if (!safeEqual(sig, sign(payload))) return false; // 위조 방지

  const [r, expStr] = payload.split('.');
  if (r !== role) return false;

  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false; // 만료 확인
  return true;
}

export async function createSession(role: Role): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME[role], makeToken(role), {
    httpOnly: true, // JS(브라우저)에서 읽을 수 없음 → XSS로 토큰 탈취 어려움
    secure: process.env.NODE_ENV === 'production', // 운영에선 HTTPS 전용
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSession(role: Role): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME[role]);
}

export async function isAuthed(role: Role): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME[role])?.value, role);
}
