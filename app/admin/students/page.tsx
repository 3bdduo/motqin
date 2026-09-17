"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { CardSkeleton } from "@/components/Skeleton";
import type { Profile } from "@/lib/types";
import { appCache, prefetchAllAdminData, subscribeToCache, cacheMutations } from "@/lib/dataCache";

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Profile[]>(() => appCache.admin.students ?? []);
  const [loading, setLoading] = useState<boolean>(() => !appCache.admin.students);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (appCache.admin.students) {
      setStudents(appCache.admin.students);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.admin.students) {
        setStudents(appCache.admin.students);
        setLoading(false);
      }
    });

    prefetchAllAdminData(supabase);

    return unsubscribe;
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`هل أنت متأكد من حذف الطالب "${name}"؟ سيتم حذف جميع بياناته ومهامه نهائياً.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        cacheMutations.removeStudent(id);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حدث خطأ أثناء حذف الطالب");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر لحذف الطالب");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = students.filter((s) => s.full_name.includes(search) || (s.phone ?? "").includes(search));

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="h1 text-theme-primary">الطلاب</h1>
          <p className="text-caption text-theme-secondary mt-1">{students.length} طالب مسجّل</p>
        </div>
        <Link href="/admin/students/new" className="btn-primary">
          + إضافة طالب
        </Link>
      </div>

      <input
        className="input max-w-xs"
        placeholder="بحث بالاسم أو الرقم..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={6} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card text-center text-body text-theme-secondary">لا يوجد طلاب مطابقين.</div>
      )}

      {!loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="card group flex items-center justify-between gap-3 p-3.5 hover:border-[#2563EB]/30 dark:hover:border-[#C87A4B]/40 transition-colors"
            >
              <Link
                href={`/admin/students/${student.id}`}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] font-extrabold text-[#1E40AF] dark:bg-[#3A2B22] dark:text-[#E09F6E]">
                  {student.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-theme-primary group-hover:text-[#2563EB] dark:group-hover:text-[#C87A4B] transition-colors">
                    {student.full_name}
                  </p>
                  <p className="text-caption text-theme-secondary">{student.phone || "بدون رقم هاتف"}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={(e) => handleDelete(e, student.id, student.full_name)}
                disabled={deletingId === student.id}
                title={`حذف الطالب ${student.full_name}`}
                aria-label={`حذف الطالب ${student.full_name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-500/10 dark:text-red-400/80 dark:hover:text-red-300 dark:hover:bg-red-500/20 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingId === student.id ? (
                  <svg className="h-4 w-4 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
