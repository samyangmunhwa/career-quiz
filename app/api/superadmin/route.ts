import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthed } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // 🔒 슈퍼관리자 세션 필수
  if (!(await isAuthed('super'))) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, school_code')
      .order('name');

    const schoolsWithClasses = await Promise.all((schools || []).map(async (school) => {
      const { data: classes } = await supabase
        .from('classes')
        .select('id, class_code')
        .eq('school_id', school.id)
        .order('class_code');
      return { ...school, classes: classes || [] };
    }));

    return NextResponse.json({ schools: schoolsWithClasses });
  }

  return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  // 🔒 학교/학급 추가·삭제는 반드시 슈퍼관리자만
  if (!(await isAuthed('super'))) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === 'add_school') {
    const { name, school_code } = body;
    if (!name || !school_code) {
      return NextResponse.json({ error: '학교명과 코드를 입력하세요' }, { status: 400 });
    }
    const { error } = await supabase
      .from('schools')
      .insert({ name, school_code });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete_school') {
    const { school_id } = body;
    // 학급 먼저 삭제
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('school_id', school_id);

    for (const cls of classes || []) {
      await supabase.from('students').delete().eq('class_id', cls.id);
    }
    await supabase.from('classes').delete().eq('school_id', school_id);
    await supabase.from('schools').delete().eq('id', school_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'add_class') {
    const { school_id, class_code } = body;
    if (!school_id || !class_code) {
      return NextResponse.json({ error: '학교와 학급코드를 입력하세요' }, { status: 400 });
    }
    const { error } = await supabase
      .from('classes')
      .insert({ school_id, class_code });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete_class') {
    const { class_id } = body;
    await supabase.from('students').delete().eq('class_id', class_id);
    await supabase.from('classes').delete().eq('id', class_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
}
