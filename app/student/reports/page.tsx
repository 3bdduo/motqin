"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamResult, Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function StudentReportsPage() {
  const supabase = createClient();
  const [results, setResults] = useState<(ExamResult & { exam: Exam })[]>([]);
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: resultRows } = await supabase
        .from("exam_results")
        .select("*, exam:exams(*)")
        .eq("student_id", userData.user.id)
        .order("taken_at", { ascending: true });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .eq("student_id", userData.user.id)
        .gte("due_date", weekAgo.toISOString().slice(0, 10));

      const tasks = (taskRows as Task[]) ?? [];
      setWeekStats({ total: tasks.length, done: tasks.filter((t) => t.status === "completed").length });
      setResults((resultRows as any) ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="p-4 text-sm text-ink-400">جاري التحميل...</p>;

  const weekPercent = weekStats.total === 0 ? 0 : Math.round((weekStats.done / weekStats.total) * 100);
  const lastResult = results[results.length - 1];
  const prevResult = results[results.length - 2];
  const trend = lastResult && prevResult ? lastResult.percentage - prevResult.percentage : null;

  return (
    <div className="space-y-5 animate-fade-up">
      <h1 className="font-extrabold text-ink-900 dark:text-white">تقريري</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">إنجاز آخر 7 أيام</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-600 dark:text-brand-400">{weekPercent}%</p>
          <p className="mt-1 text-xs text-ink-400">
            {weekStats.done} من {weekStats.total} مهمة
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">آخر امتحان</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">
            {lastResult ? `${Math.round(lastResult.percentage)}%` : "—"}
          </p>
          {trend !== null && (
            <p className={`mt-1 text-xs font-bold ${trend >= 0 ? "text-brand-600" : "text-coral-600"}`}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(Math.round(trend))}% عن السابق
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-extrabold text-ink-900 dark:text-white">سجل الامتحانات الشهرية</h2>
        {results.length === 0 && (
          <div className="card text-center text-sm text-ink-400">لسه معملتش أي امتحان شهري.</div>
        )}
        <div className="space-y-2">
          {[...results].reverse().map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-bold text-ink-900 dark:text-white">{r.exam?.title}</p>
                <p className="text-xs text-ink-400">
                  {r.exam?.subject} • {formatDate(r.taken_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, r.percentage)}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-extrabold text-ink-900 dark:text-white">
                  {Math.round(r.percentage)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
