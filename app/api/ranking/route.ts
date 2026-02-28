import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session_token = searchParams.get('token');
  const supabase = createServerClient();

  // 1. 학생 확인
  const { data: student } = await supabase
    .from('students')
    .select('class_id, explored_count')
    .eq('session_token', session_token!)
    .single();

  if (!student) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  // 2. 같은 학급 전체 랭킹
  const { data: ranking } = await supabase
    .from('students')
    .select('nickname, explored_count, is_completed')
    .eq('class_id', student.class_id)
    .order('explored_count', { ascending: false })
    .limit(50);

  // 3. 학급 평균 계산
  const avg = ranking
    ? Math.round(ranking.reduce((s, r) => s + r.explored_count, 0) / ranking.length)
    : 0;

  return NextResponse.json({
    ranking,
    class_avg: avg,
    my_count: student.explored_count
  });
}