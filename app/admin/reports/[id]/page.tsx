"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamResult, Profile, Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminStudentReportPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<(ExamResult & { exam: Exam })[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, late: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();

      const { data: resultRows } = await supabase
        .from("exam_results")
        .select("*, exam:exams(*)")
        .eq("student_id", id)
        .order("taken_at", { ascending: true });

      const { data: taskRows } = await supabase.from("tasks").select("*").eq("student_id", id);
      const tasks = (taskRows as Task[]) ?? [];

      setProfile(p as Profile);
      setResults((resultRows as any) ?? []);
      setTaskStats({
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        late: tasks.filter((t) => t.status === "late").length,
      });
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="text-sm text-ink-400">جاري التحميل...</p>;
  if (!profile) return <p className="text-sm text-ink-400">الطالب غير موجود</p>;

  const bySubject: Record<string, { total: number; count: number }> = {};
  results.forEach((r) => {
    const subj = r.exam?.subject ?? "غير محدد";
    bySubject[subj] = bySubject[subj] ?? { total: 0, count: 0 };
    bySubject[subj].total += r.percentage;
    bySubject[subj].count += 1;
  });
  const subjectAverages = Object.entries(bySubject)
    .map(([subject, v]) => ({ subject, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg);

  const strong = subjectAverages.filter((s) => s.avg >= 70);
  const weak = subjectAverages.filter((s) => s.avg < 70);

  const last = results[results.length - 1];
  const prev = results[results.length - 2];
  const completionRate = taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div className="max-w-3xl animate-fade-up space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">تقرير مستوى {profile.full_name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">آخر درجة</p>
          <p className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white">
            {last ? `${Math.round(last.percentage)}%` : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">التغيّر</p>
          <p
            className={`mt-1 text-xl font-extrabold ${
              last && prev
                ? last.percentage - prev.percentage >= 0
                  ? "text-brand-600"
                  : "text-coral-600"
                : "text-ink-400"
            }`}
          >
            {last && prev ? `${last.percentage - prev.percentage >= 0 ? "+" : ""}${Math.round(last.percentage - prev.percentage)}%` : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">إنجاز المهام</p>
          <p className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white">{completionRate}%</p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-ink-400">مهام متأخرة</p>
          <p className="mt-1 text-xl font-extrabold text-coral-600">{taskStats.late}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-extrabold text-brand-700 dark:text-brand-400">نقاط القوة</h2>
          {strong.length === 0 && <p className="text-sm text-ink-400">لا توجد بيانات كافية بعد.</p>}
          <ul className="space-y-1.5">
            {strong.map((s) => (
              <li key={s.subject} className="flex justify-between text-sm">
                <span className="font-bold text-ink-800 dark:text-ink-100">{s.subject}</span>
                <span className="font-extrabold text-brand-600">{Math.round(s.avg)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-extrabold text-coral-700 dark:text-coral-400">يحتاج تحسين</h2>
          {weak.length === 0 && <p className="text-sm text-ink-400">لا توجد بيانات كافية بعد.</p>}
          <ul className="space-y-1.5">
            {weak.map((s) => (
              <li key={s.subject} className="flex justify-between text-sm">
                <span className="font-bold text-ink-800 dark:text-ink-100">{s.subject}</span>
                <span className="font-extrabold text-coral-600">{Math.round(s.avg)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-extrabold text-ink-900 dark:text-white">سجل الامتحانات</h2>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-bold text-ink-900 dark:text-white">{r.exam?.title}</p>
                <p className="text-xs text-ink-400">
                  {r.exam?.subject} • {formatDate(r.taken_at)}
                </p>
              </div>
              <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {Math.round(r.percentage)}%
              </span>
            </div>
          ))}
          {results.length === 0 && (
            <div className="card text-center text-sm text-ink-400">لم يؤدِّ الطالب أي امتحان بعد.</div>
          )}
        </div>
      </div>
    </div>
  );
}
