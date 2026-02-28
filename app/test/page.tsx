"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // ✅ 경로 중요

type Job = { job_name: string; difficulty: string };

export default function TestPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState("시작...");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("Supabase 요청 중...");
        const { data, error } = await supabase
          .from("jobs")
          .select("job_name, difficulty")
          .limit(10);

        if (error) {
          setErrorText(`${error.message} (code: ${error.code ?? "-"})`);
          setStatus("에러 발생");
          return;
        }

        setJobs((data as Job[]) ?? []);
        setStatus(`성공! ${data?.length ?? 0}개 로드`);
      } catch (e: any) {
        setErrorText(e?.message ?? String(e));
        setStatus("예외 발생");
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Supabase 연결 테스트</h1>
      <p><b>상태:</b> {status}</p>

      {errorText && (
        <pre style={{ background: "#f7f7f7", padding: 12, whiteSpace: "pre-wrap" }}>
          {errorText}
        </pre>
      )}

      <ul>
        {jobs.map((j, i) => (
          <li key={i}>
            {j.job_name} — {j.difficulty}
          </li>
        ))}
      </ul>
    </main>
  );
}