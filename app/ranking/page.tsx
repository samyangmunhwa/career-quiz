'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RankingEntry {
  nickname: string;
  explored_count: number;
  is_completed: boolean;
}

export default function RankingPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myCount, setMyCount] = useState(0);
  const [classAvg, setClassAvg] = useState(0);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const nick = localStorage.getItem('nickname');
    if (!token) { router.push('/'); return; }
    setNickname(nick || '');
    fetch(`/api/ranking?token=${token}`)
      .then(r => r.json())
      .then(data => {
        setRanking(data.ranking || []);
        setMyCount(data.my_count || 0);
        setClassAvg(data.class_avg || 0);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <p style={{ color: 'white', fontSize: '24px' }}>랭킹 불러오는 중... 🏆</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', paddingTop: '20px' }}>

        <h1 style={{ color: 'white', textAlign: 'center', fontSize: '24px', marginBottom: '8px' }}>🏆 학급 랭킹</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>우리 반 직업 탐색 현황</p>

        {/* 내 현황 */}
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>내 탐색 수</p>
            <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{myCount}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>학급 평균</p>
            <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{classAvg}</p>
          </div>
        </div>

        {/* 랭킹 목록 */}
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          {ranking.map((entry, index) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              borderBottom: index < ranking.length - 1 ? '1px solid #f3f4f6' : 'none',
              background: entry.nickname === nickname ? '#ede9fe' : 'white'
            }}>
              <span style={{ fontSize: '20px', width: '36px', textAlign: 'center' }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <span style={{ flex: 1, fontWeight: entry.nickname === nickname ? 'bold' : 'normal', color: '#1f2937', marginLeft: '12px' }}>
                {entry.nickname} {entry.nickname === nickname ? '(나)' : ''}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold', color: '#667eea', fontSize: '18px' }}>{entry.explored_count}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>/100</span>
                {entry.is_completed && <span style={{ marginLeft: '8px', fontSize: '16px' }}>🎉</span>}
              </div>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <button
          onClick={() => router.push('/challenge')}
          style={{ width: '100%', padding: '14px', background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
        >
          챌린지 계속하기 🚀
        </button>
      </div>
    </main>
  );
}