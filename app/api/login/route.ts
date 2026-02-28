import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { school_code, class_code, nickname } = await req.json();

  if (!school_code || !class_code || !nickname) {
    return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('school_code', school_code)
    .single();

  if (!school) {
    return NextResponse.json({ error: '존재하지 않는 학교코드입니다' }, { status: 404 });
  }

  const { data: cls } = await supabase
    .from('classes')
    .select('id')
    .eq('school_id', school.id)
    .eq('class_code', class_code)
    .single();

  if (!cls) {
    return NextResponse.json({ error: '존재하지 않는 학급코드입니다' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('students')
    .select('id, session_token, explored_count, is_completed')
    .eq('class_id', cls.id)
    .eq('nickname', nickname)
    .single();

  if (existing) {
    return NextResponse.json({ student: existing });
  }

  const { data: student, error } = await supabase
    .from('students')
    .insert({ class_id: cls.id, nickname })
    .select('id, session_token, explored_count, is_completed')
    .single();

  if (error) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }

  return NextResponse.json({ student });
}