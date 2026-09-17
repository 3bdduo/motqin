"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { TableRowSkeleton } from "@/components/Skeleton";
import type { Exam } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { appCache, prefetchAllAdminData, subscribeToCache } from "@/lib/dataCache";

export default function AdminExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>(() => appCache.admin.exams ?? []);
  const [loading, setLoading] = useState<boolean>(() => !appCache.admin.exams);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (appCache.admin.exams) {
      setExams(appCache.admin.exams);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.admin.exams) {
        setExams(appCache.admin.exams);
        setLoading(false);
      }
    });

    prefetchAllAdminData(supabase);

    return unsubscribe;
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الامتحان وكل نتائجه؟")) return;
    setDeletingId(id);
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1 text-theme-primary">الامتحانات الشهرية</h1>
        <Link href="/admin/exams/new" className="btn-primary">
          + إنشاء امتحان
        </Link>
      </div>

      {loading && <TableRowSkeleton count={3} />}

      {!loading && exams.length === 0 && (
        <div className="card text-center text-body text-theme-secondary">لا يوجد امتحانات مضافة بعد.</div>
      )}

      {!loading && (
        <div className="space-y-2">
          {exams.map((exam) => (
            <div key={exam.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="badge">{exam.subject}</span>
                <h3 className="h3 text-theme-primary mt-1.5">{exam.title}</h3>
                <p className="text-caption text-theme-secondary">{formatDateTime(exam.exam_date)}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/exams/${exam.id}`} className="btn-secondary">
                  النتائج
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === exam.id}
                  loadingText="..."
                  onClick={() => handleDelete(exam.id)}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
