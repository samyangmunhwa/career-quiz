'use client';

import { useState } from 'react';

interface School {
  id: string;
  name: string;
  school_code: string;
  classes: Class[];
}

interface Class {
  id: string;
  class_code: string;
}

export default function SuperAdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  // 새 학교 추가
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');

  // 새 학급 추가
  const [newClassCode, setNewClassCode] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  async function fetchSchools() {
    const res = await fetch('/api/superadmin?action=list');
    const data = await res.json();
    setSchools(data.schools || []);
  }

  async function handleLogin() {
    setError('');
    // 비밀번호를 서버에서 검증 → 세션 쿠키 발급
    const res = await fetch('/api/superadmin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || '비밀번호가 틀렸습니다');
      return;
    }
    setLoggedIn(true);
    fetchSchools();
  }

  async function handleLogout() {
    await fetch('/api/superadmin/login', { method: 'DELETE' });
    setLoggedIn(false);
    setPassword('');
  }

  async function addSchool() {
    if (!newSchoolName.trim() || !newSchoolCode.trim()) return;
    setLoading(true);
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_school', name: newSchoolName, school_code: newSchoolCode.toUpperCase() })
    });
    setNewSchoolName('');
    setNewSchoolCode('');
    await fetchSchools();
    setLoading(false);
  }

  async function deleteSchool(schoolId: string) {
    if (!confirm('학교를 삭제하면 모든 학급과 학생 데이터가 삭제됩니다. 계속하시겠습니까?')) return;
    setLoading(true);
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_school', school_id: schoolId })
    });
    await fetchSchools();
    setLoading(false);
  }

  async function addClass() {
    if (!newClassCode.trim() || !selectedSchoolId) return;
    setLoading(true);
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_class', school_id: selectedSchoolId, class_code: newClassCode })
    });
    setNewClassCode('');
    await fetchSchools();
    setLoading(false);
  }

  async function deleteClass(classId: string) {
    if (!confirm('학급을 삭제하면 해당 학생 데이터가 삭제됩니다. 계속하시겠습니까?')) return;
    setLoading(true);
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_class', class_id: classId })
    });
    await fetchSchools();
    setLoading(false);
  }

  if (!loggedIn) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px', textAlign: 'center' }}>⚙️ 공급자 관리자</h1>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '13px' }}>(주)삼양문화 전용</p>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="관리자 비밀번호"
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box' as const }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            로그인 🔐
          </button>
        </div>
      </main>
    );
  }
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '20px' }}>

        <h1 style={{ color: 'white', fontSize: '22px', textAlign: 'center', marginBottom: '4px' }}>⚙️ 공급자 관리자</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '24px', fontSize: '13px' }}>(주)삼양문화 전용</p>

        {/* 학교 추가 */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>🏫 새 학교 추가</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
              placeholder="학교명 (예: 삼양중학교)"
              style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px' }}
            />
            <input
              type="text"
              value={newSchoolCode}
              onChange={e => setNewSchoolCode(e.target.value)}
              placeholder="학교코드 (예: SCHOOL002)"
              style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px' }}
            />
            <button
              onClick={addSchool}
              disabled={loading}
              style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + 추가
            </button>
          </div>
        </div>

        {/* 학급 추가 */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>📚 새 학급 추가</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={selectedSchoolId}
              onChange={e => setSelectedSchoolId(e.target.value)}
              style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px' }}
            >
              <option value="">학교 선택</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.school_code})</option>
              ))}
            </select>
            <input
              type="text"
              value={newClassCode}
              onChange={e => setNewClassCode(e.target.value)}
              placeholder="학급코드 (예: 3-1)"
              style={{ flex: 1, minWidth: '100px', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px' }}
            />
            <button
              onClick={addClass}
              disabled={loading}
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + 추가
            </button>
          </div>
        </div>

        {/* 학교 목록 */}
        {schools.map((school) => (
          <div key={school.id} style={{ background: 'white', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#1a1a2e', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{school.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginLeft: '10px' }}>{school.school_code}</span>
              </div>
              <button
                onClick={() => deleteSchool(school.id)}
                style={{ padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                삭제
              </button>
            </div>
            {school.classes.length === 0 ? (
              <p style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '14px' }}>등록된 학급 없음</p>
            ) : (
              school.classes.map((cls) => (
                <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#374151', fontSize: '15px' }}>📌 {cls.class_code}</span>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    style={{ padding: '4px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        ))}

        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
