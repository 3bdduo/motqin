"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("full_name", { ascending: true });
      setStudents((data as Profile[]) ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = students.filter((s) => s.full_name.includes(search) || (s.phone ?? "").includes(search));

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">الطلاب</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">{students.length} طالب مسجّل</p>
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

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card text-center text-sm text-ink-400">لا يوجد طلاب مطابقين.</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((student) => (
          <Link key={student.id} href={`/admin/students/${student.id}`} className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-extrabold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {student.full_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900 dark:text-white">{student.full_name}</p>
                <p className="text-xs text-ink-400">{student.phone || "بدون رقم هاتف"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
