'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [schoolCode, setSchoolCode] = useState('');
  const [classCode, setClassCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        school_code: schoolCode,
        class_code: classCode,
        nickname: nickname
      })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // session_token을 localStorage에 저장
    localStorage.setItem('session_token', data.student.session_token);
    localStorage.setItem('nickname', nickname);

    router.push('/challenge');
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>
          🏫 직업 탐색 챌린지
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px', fontSize: '14px' }}>
          4주 동안 100개의 직업을 탐색해보세요!
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            학교 코드
          </label>
          <input
            type="text"
            value={schoolCode}
            onChange={e => setSchoolCode(e.target.value)}
            placeholder="예: SCHOOL001"
            style={{
              width: '100%', padding: '12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            학급 코드
          </label>
          <input
            type="text"
            value={classCode}
            onChange={e => setClassCode(e.target.value)}
            placeholder="예: 3-1"
            style={{
              width: '100%', padding: '12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="예: 멋진탐험가"
            style={{
              width: '100%', padding: '12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', background: loading ? '#9ca3af' : '#667eea',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '로딩 중...' : '챌린지 시작하기 🚀'}
        </button>
      </div>
    </main>
  );
}