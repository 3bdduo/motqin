"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Exam } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("exams").select("*").order("exam_date", { ascending: false });
      setExams((data as Exam[]) ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الامتحان وكل نتائجه؟")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">الامتحانات الشهرية</h1>
        <Link href="/admin/exams/new" className="btn-primary">
          + إنشاء امتحان
        </Link>
      </div>

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      {!loading && exams.length === 0 && (
        <div className="card text-center text-sm text-ink-400">لا يوجد امتحانات مضافة بعد.</div>
      )}

      <div className="space-y-2">
        {exams.map((exam) => (
          <div key={exam.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                {exam.subject}
              </span>
              <h3 className="mt-1.5 font-bold text-ink-900 dark:text-white">{exam.title}</h3>
              <p className="text-xs text-ink-400">{formatDateTime(exam.exam_date)}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/exams/${exam.id}`} className="btn-secondary">
                النتائج
              </Link>
              <button onClick={() => handleDelete(exam.id)} className="btn-danger">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
