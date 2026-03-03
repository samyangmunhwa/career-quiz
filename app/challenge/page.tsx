'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  job_name: string;
  one_liner: string;
  initials: string;
  difficulty: string;
  is_hidden: boolean;
}

export default function ChallengePage() {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [exploredCount, setExploredCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [isCombo, setIsCombo] = useState(false);
  const [isFuture, setIsFuture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const nick = localStorage.getItem('nickname');
    if (!token) {
      router.push('/');
      return;
    }
    setNickname(nick || '');
    fetchNextJob();
  }, []);

  async function fetchNextJob() {
    setLoading(true);
    setResult(null);
    setAnswer('');
    const token = localStorage.getItem('session_token');
    const res = await fetch('/api/next-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: token })
    });
    const data = await res.json();
    setLoading(false);
    if (data.done) {
      router.push('/complete');
      return;
    }
    setJob(data.job);
    setIsCombo(data.combo);
    setIsFuture(data.is_future);
    setExploredCount(data.explored_count);
  }

  async function handleSubmit() {
    if (!job || !answer.trim()) return;
    const correct = answer.trim() === job.job_name;
    setResult(correct ? 'correct' : 'wrong');
    if (correct) {
      const token = localStorage.getItem('session_token');
      const res = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: token,
          job_id: job.id,
          is_combo: isCombo,
          is_future: isFuture
        })
      });
      const data = await res.json();
      if (data.is_completed) {
        setTimeout(() => router.push('/complete'), 1500);
        return;
      }
      setExploredCount(data.explored_count);
      setTimeout(() => fetchNextJob(), 1500);
    }
  }

  if (loading || !job) {
    return (
      <main style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <p style={{ color: 'white', fontSize: '24px' }}>직업 불러오는 중... ✨</p>
      </main>
    );
  }
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', marginBottom: '8px' }}>
          <span>👤 {nickname}</span>
          <span>🏆 {exploredCount} / 100</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', height: '10px' }}>
          <div style={{
            background: 'white', borderRadius: '999px', height: '10px',
            width: `${exploredCount}%`, transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {isFuture && (
            <span style={{
              background: '#7c3aed', color: 'white', padding: '4px 12px',
              borderRadius: '999px', fontSize: '12px', fontWeight: 'bold'
            }}>🔮 미래직업 발견!</span>
          )}
          {isCombo && (
            <span style={{
              background: '#f59e0b', color: 'white', padding: '4px 12px',
              borderRadius: '999px', fontSize: '12px', fontWeight: 'bold'
            }}>⚡ 콤보!</span>
          )}
          <span style={{
            background: job.difficulty === 'easy' ? '#10b981' : job.difficulty === 'mid' ? '#f59e0b' : '#ef4444',
            color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '12px'
          }}>
            {job.difficulty === 'easy' ? '쉬움' : job.difficulty === 'mid' ? '보통' : '어려움'}
          </span>
        </div>

        <p style={{ fontSize: '18px', color: '#374151', marginBottom: '24px', lineHeight: '1.6' }}>
          💡 {job.one_liner}
        </p>

        <div style={{
          background: '#f3f4f6', borderRadius: '12px', padding: '16px',
          marginBottom: '24px', textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>초성 힌트</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', color: '#1f2937' }}>
            {job.initials}
          </p>
        </div>

        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="직업 이름을 입력하세요"
          disabled={result !== null}
          style={{
            width: '100%', padding: '14px', border: '2px solid #e5e7eb',
            borderRadius: '10px', fontSize: '16px', marginBottom: '12px',
            boxSizing: 'border-box' as const,
            borderColor: result === 'correct' ? '#10b981' : result === 'wrong' ? '#ef4444' : '#e5e7eb'
          }}
        />

        {result === 'correct' && (
          <p style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', fontSize: '18px' }}>
            🎉 정답! {job.job_name}
          </p>
        )}
        {result === 'wrong' && (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '16px' }}>❌ 틀렸어요!</p>
            <button
              onClick={() => setResult(null)}
              style={{
                marginTop: '8px', padding: '8px 20px', background: '#f3f4f6',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
              }}
            >다시 시도</button>
          </div>
        )}

        {result === null && (
          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '14px', background: '#667eea',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >정답 제출 ✅</button>
        )}

        <button
          onClick={fetchNextJob}
          style={{
            width: '100%', padding: '12px', background: 'transparent',
            color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '10px',
            fontSize: '14px', cursor: 'pointer', marginTop: '8px'
          }}
        >모르겠어요, 다음 직업 →</button>
        <button
  onClick={() => router.push('/ranking')}
  style={{ width: '100%', padding: '10px', background: 'transparent', color: '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}
>
  🏆 학급 랭킹 보기
</button>
      </div>
    </main>
  );
}