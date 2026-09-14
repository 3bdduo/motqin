"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamResult } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function StudentExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Record<string, ExamResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: examRows } = await supabase
        .from("exams")
        .select("*")
        .order("exam_date", { ascending: false });

      const { data: resultRows } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_id", userData.user.id);

      const map: Record<string, ExamResult> = {};
      (resultRows as ExamResult[] | null)?.forEach((r) => (map[r.exam_id] = r));

      setExams((examRows as Exam[]) ?? []);
      setResults(map);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="font-extrabold text-ink-900 dark:text-white">الامتحانات الشهرية 📝</h1>

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      {!loading && exams.length === 0 && (
        <div className="card text-center text-sm text-ink-400">لا يوجد امتحانات مضافة حاليًا.</div>
      )}

      <div className="space-y-3">
        {exams.map((exam) => {
          const result = results[exam.id];
          const isPast = new Date(exam.exam_date).getTime() < Date.now();

          return (
            <Link key={exam.id} href={`/student/exams/${exam.id}`} className="card block">
              <div className="flex items-center justify-between">
                <div>
                  <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                    {exam.subject}
                  </span>
                  <h3 className="mt-1.5 font-bold text-ink-900 dark:text-white">{exam.title}</h3>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(exam.exam_date)}</p>
                </div>
                {result ? (
                  <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {Math.round(result.percentage)}%
                  </span>
                ) : (
                  <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {isPast ? "لم يُؤدَّ" : "قريبًا"}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
