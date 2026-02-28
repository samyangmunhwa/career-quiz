import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { session_token, job_id, is_combo, is_future } = await req.json();
  const supabase = createServerClient();

  // 1. 학생 확인
  const { data: student } = await supabase
    .from('students')
    .select('id, explored_count, combo_count')
    .eq('session_token', session_token)
    .single();

  if (!student) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  // 2. 탐색 기록 저장
  const { error: insertError } = await supabase
    .from('explored_jobs')
    .insert({ student_id: student.id, job_id, is_combo, is_future });

  if (insertError?.code === '23505') {
    return NextResponse.json({ error: '이미 탐색한 직업입니다' }, { status: 409 });
  }

  if (insertError) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }

  // 3. 카운트 업데이트
  const newCount = student.explored_count + 1;
  const newCombo = is_combo ? Math.min(student.combo_count + 1, 3) : 0;
  const isCompleted = newCount >= 100;

  await supabase
    .from('students')
    .update({
      explored_count: newCount,
      combo_count: newCombo,
      is_completed: isCompleted,
      ...(isCompleted ? { completed_at: new Date().toISOString() } : {})
    })
    .eq('id', student.id);

  return NextResponse.json({ explored_count: newCount, is_completed: isCompleted });
}