import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session_token = searchParams.get('token');
  const supabase = createServerClient();

  const { data: student } = await supabase
    .from('students')
    .select(`
      nickname, explored_count, is_completed, completed_at,
      classes ( class_code, schools ( name ) )
    `)
    .eq('session_token', session_token!)
    .single();

  if (!student) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  if (!student.is_completed) {
    return NextResponse.json({ error: '챌린지 미완료' }, { status: 403 });
  }

  const classes = student.classes as any;

  return NextResponse.json({
    nickname: student.nickname,
    school_name: classes?.schools?.name,
    class_code: classes?.class_code,
    completed_at: student.completed_at,
    explored_count: student.explored_count
  });
}