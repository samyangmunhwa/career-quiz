import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { session_token } = await req.json();
  const supabase = createServerClient();

  // 1. 학생 정보 조회
  const { data: student } = await supabase
    .from('students')
    .select('id, explored_count, combo_count')
    .eq('session_token', session_token)
    .single();

  if (!student) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  // 2. 이미 탐색한 직업 ID 목록
  const { data: explored } = await supabase
    .from('explored_jobs')
    .select('job_id')
    .eq('student_id', student.id);

  const exploredIds = explored?.map(e => e.job_id) ?? [];

  // 3. 미래직업 등장 여부 (6% 확률)
  const showFuture = Math.random() < 0.06;

  // 4. 난이도 가중치 결정
  const count = student.explored_count;
  let difficultyFilter: string | null = null;
  if (!showFuture) {
    if (count < 30) {
      difficultyFilter = 'easy';
    } else if (count < 50) {
      difficultyFilter = Math.random() < 0.7 ? 'easy' : null;
    }
  }

  // 5. 후보 직업 쿼리
  let query = supabase
    .from('jobs')
    .select('id, job_name, one_liner, initials, difficulty, is_hidden');

  if (exploredIds.length > 0) {
    query = query.not('id', 'in', `(${exploredIds.join(',')})`);
  }

  if (showFuture) {
    query = query.eq('is_hidden', true);
  } else {
    query = query.eq('is_hidden', false);
    if (difficultyFilter) {
      query = query.eq('difficulty', difficultyFilter);
    }
  }

  const { data: candidates } = await query;

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ done: true });
  }

  // 6. 랜덤 1개 선택
  const job = candidates[Math.floor(Math.random() * candidates.length)];

  // 7. 콤보 여부 결정 (10% 확률, 최대 3연속)
  const combo = student.combo_count < 3 && Math.random() < 0.1;

  return NextResponse.json({
    job,
    is_future: showFuture,
    combo,
    explored_count: count
  });
}