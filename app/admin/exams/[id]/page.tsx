"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamResult, Profile } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminExamResultsPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<(ExamResult & { student: Profile })[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: examRow } = await supabase.from("exams").select("*").eq("id", id).single();
      const { data: resultRows } = await supabase
        .from("exam_results")
        .select("*, student:profiles(*)")
        .eq("exam_id", id)
        .order("percentage", { ascending: false });
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student");

      setExam(examRow as Exam);
      setResults((resultRows as any) ?? []);
      setTotalStudents(count ?? 0);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="text-sm text-ink-400">جاري التحميل...</p>;
  if (!exam) return <p className="text-sm text-ink-400">الامتحان غير موجود</p>;

  const avg = results.length ? results.reduce((s, r) => s + r.percentage, 0) / results.length : 0;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">{exam.subject}</span>
        <h1 className="mt-1.5 text-xl font-extrabold text-ink-900 dark:text-white">{exam.title}</h1>
        <p className="text-sm text-ink-400">{formatDateTime(exam.exam_date)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">أدّى الامتحان</p>
          <p className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white">
            {results.length}/{totalStudents}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">المتوسط</p>
          <p className="mt-1 text-xl font-extrabold text-brand-600 dark:text-brand-400">
            {Math.round(avg)}%
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">أعلى نتيجة</p>
          <p className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white">
            {results.length ? Math.round(results[0].percentage) : 0}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <p className="font-bold text-ink-900 dark:text-white">{r.student?.full_name}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-400">
                {r.score}/{r.total}
              </span>
              <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {Math.round(r.percentage)}%
              </span>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="card text-center text-sm text-ink-400">لم يؤدِّ أي طالب هذا الامتحان بعد.</div>
        )}
      </div>
    </div>
  );
}
