'use client';

import { useState } from 'react';

interface Student {
  nickname: string;
  explored_count: number;
  is_completed: boolean;
  created_at: string;
}

interface ClassData {
  class_code: string;
  students: Student[];
  avg_count: number;
  completed_count: number;
}

export default function AdminPage() {
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<ClassData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  async function handleLogin() {
    if (!schoolCode.trim()) { setError('학교 코드를 입력하세요'); return; }
    if (password !== 'admin1234') { setError('관리자 비밀번호가 틀렸습니다'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin?school_code=${schoolCode}`);
    const json = await res.json();
    if (json.error) { setError(json.error); setLoading(false); return; }
    setData(json.classes || []);
    setLoggedIn(true);
    setLoading(false);
  }

  if (!loggedIn) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', textAlign: 'center' }}>🏫 관리자 페이지</h1>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>학생 진행 현황을 확인하세요</p>

          <label style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold' }}>학교 코드</label>
          <input
            type="text"
            value={schoolCode}
            onChange={e => setSchoolCode(e.target.value)}
            placeholder="예: SCHOOL001"
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', marginBottom: '16px', marginTop: '6px', boxSizing: 'border-box' as const }}
          />

          <label style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold' }}>관리자 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', marginBottom: '16px', marginTop: '6px', boxSizing: 'border-box' as const }}
          />

          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? '확인 중...' : '로그인 🔐'}
          </button>
        </div>
      </main>
    );
  }
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '20px' }}>

        <h1 style={{ color: 'white', fontSize: '24px', textAlign: 'center', marginBottom: '4px' }}>🏫 학생 진행 현황</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>{schoolCode}</p>

        {data.map((cls, ci) => (
          <div key={ci} style={{ background: 'white', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>

            {/* 학급 헤더 */}
            <div style={{ background: '#667eea', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{cls.class_code}</h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 탐색</p>
                  <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{cls.avg_count}개</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>완료</p>
                  <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{cls.completed_count}명</p>
                </div>
              </div>
            </div>

            {/* 학생 목록 */}
            {cls.students.map((student, si) => (
              <div key={si} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: si < cls.students.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize: '18px', width: '32px' }}>
                  {si === 0 ? '🥇' : si === 1 ? '🥈' : si === 2 ? '🥉' : `${si + 1}`}
                </span>
                <span style={{ flex: 1, color: '#1f2937', fontWeight: '500', marginLeft: '8px' }}>{student.nickname}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '8px', width: '80px' }}>
                    <div style={{ background: '#667eea', borderRadius: '999px', height: '8px', width: `${Math.min(student.explored_count, 100)}%` }} />
                  </div>
                  <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '14px', minWidth: '48px', textAlign: 'right' }}>{student.explored_count}/100</span>
                  {student.is_completed && <span style={{ fontSize: '16px' }}>🎉</span>}
                </div>
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={() => setLoggedIn(false)}
          style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}