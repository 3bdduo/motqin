"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatsCardSkeleton, TableRowSkeleton } from "@/components/Skeleton";
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

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-5 w-20 rounded-full bg-[#EFF6FF] dark:bg-[#271F1A] animate-pulse" />
          <div className="h-8 w-64 rounded-xl bg-[#EFF6FF] dark:bg-[#271F1A] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatsCardSkeleton count={3} />
        </div>
        <TableRowSkeleton count={4} />
      </div>
    );
  }

  if (!exam) return <p className="text-caption text-theme-secondary">الامتحان غير موجود</p>;

  const avg = results.length ? results.reduce((s, r) => s + r.percentage, 0) / results.length : 0;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <span className="badge">{exam.subject}</span>
        <h1 className="h1 text-theme-primary mt-1.5">{exam.title}</h1>
        <p className="text-caption text-theme-secondary">{formatDateTime(exam.exam_date)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-caption text-theme-secondary">أدّى الامتحان</p>
          <p className="mt-1 h2 text-theme-primary">
            {results.length}/{totalStudents}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-caption text-theme-secondary">المتوسط</p>
          <p className="mt-1 h2 text-[#2563EB] dark:text-[#C87A4B]">
            {Math.round(avg)}%
          </p>
        </div>
        <div className="card text-center">
          <p className="text-caption text-theme-secondary">أعلى نتيجة</p>
          <p className="mt-1 h2 text-theme-primary">
            {results.length ? Math.round(results[0].percentage) : 0}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <p className="font-bold text-theme-primary">{r.student?.full_name}</p>
            <div className="flex items-center gap-2">
              <span className="text-caption text-theme-secondary">
                {r.score}/{r.total}
              </span>
              <span className="badge font-extrabold">
                {Math.round(r.percentage)}%
              </span>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="card text-center text-body text-theme-secondary">لم يؤدِّ أي طالب هذا الامتحان بعد.</div>
        )}
      </div>
    </div>
  );
}
