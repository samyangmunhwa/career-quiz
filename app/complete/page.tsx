'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CompletePage() {
  const router = useRouter();
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const nick = localStorage.getItem('nickname');
    if (!token) { router.push('/'); return; }
    setNickname(nick || '');
    fetch(`/api/certificate?token=${token}`)
      .then(r => r.json())
      .then(data => {
        setCertData(data);
        setLoading(false);
      });
  }, []);

  function handlePrint() {
    window.print();
  }

  const completedDate = certData?.completed_at
    ? new Date(certData.completed_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <p style={{ color: 'white', fontSize: '24px' }}>인증서 불러오는 중... 🎓</p>
      </main>
    );
  }
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      {/* 인증서 */}
      <div ref={printRef} style={{ background: 'white', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center', border: '8px solid #667eea', position: 'relative' }}>

        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>직업 탐색 챌린지</h1>
        <h2 style={{ fontSize: '18px', color: '#667eea', marginBottom: '32px' }}>완료 인증서</h2>

        <div style={{ borderTop: '2px solid #e5e7eb', borderBottom: '2px solid #e5e7eb', padding: '24px 0', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>이 인증서는</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{certData?.nickname} 님</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            {certData?.school_name} {certData?.class_code}
          </p>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
            4주 직업 탐색 챌린지에서<br />
            <strong style={{ color: '#667eea', fontSize: '20px' }}>100개</strong>의 직업을 탐색하고<br />
            성공적으로 완료하였음을 인증합니다.
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>완료일</p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', marginBottom: '24px' }}>{completedDate}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '12px 20px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>탐색한 직업 수</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>100개 🏆</p>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div style={{ width: '100%', maxWidth: '500px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handlePrint}
          style={{ width: '100%', padding: '16px', background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🖨️ 인증서 인쇄 / PDF 저장
        </button>
        <button
          onClick={() => router.push('/ranking')}
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🏆 학급 랭킹 보기
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </main>
  );
}