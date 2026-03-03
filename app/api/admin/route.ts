import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const school_code = searchParams.get('school_code');

  if (!school_code) {
    return NextResponse.json({ error: '학교 코드가 필요합니다' }, { status: 400 });
  }

  const { data: school } = await supabase
    .from('schools')
    .select('id, name')
    .eq('school_code', school_code)
    .single();

  if (!school) {
    return NextResponse.json({ error: '존재하지 않는 학교코드입니다' }, { status: 404 });
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('id, class_code')
    .eq('school_id', school.id)
    .order('class_code');

  if (!classes || classes.length === 0) {
    return NextResponse.json({ classes: [] });
  }

  const classesData = await Promise.all(classes.map(async (cls) => {
    const { data: students } = await supabase
      .from('students')
      .select('nickname, explored_count, is_completed, created_at')
      .eq('class_id', cls.id)
      .order('explored_count', { ascending: false });

    const list = students || [];
    const avg = list.length > 0
      ? Math.round(list.reduce((sum, s) => sum + s.explored_count, 0) / list.length)
      : 0;
    const completed = list.filter(s => s.is_completed).length;

    return {
      class_code: cls.class_code,
      students: list,
      avg_count: avg,
      completed_count: completed
    };
  }));

  return NextResponse.json({ classes: classesData });
}