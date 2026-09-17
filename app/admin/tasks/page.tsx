"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { TableRowSkeleton } from "@/components/Skeleton";
import type { Profile, Task } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { appCache, prefetchAllAdminData, subscribeToCache } from "@/lib/dataCache";

const statusLabel: Record<string, string> = {
  pending: "لسه",
  completed: "منجزة",
  late: "متأخرة",
};

export default function AdminTasksPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Profile[]>(() => appCache.admin.students ?? []);
  const [studentId, setStudentId] = useState(() => appCache.admin.students?.[0]?.id ?? "");
  const [dayNumber, setDayNumber] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({ subject: "", title: "", description: "", duration_minutes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appCache.admin.students && appCache.admin.students.length > 0) {
      setStudents(appCache.admin.students);
      if (!studentId) {
        setStudentId(appCache.admin.students[0].id);
      }
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.admin.students && appCache.admin.students.length > 0) {
        setStudents(appCache.admin.students);
        setStudentId((prev) => prev || appCache.admin.students![0].id);
      }
    });

    prefetchAllAdminData(supabase);

    return unsubscribe;
  }, []);

  async function loadTasks() {
    if (!studentId) return;
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", studentId)
      .eq("day_number", dayNumber)
      .order("created_at");
    setTasks((data as Task[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, dayNumber]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        subject: form.subject,
        title: form.title,
        description: form.description || null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        day_number: dayNumber,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "حدث خطأ");
      return;
    }

    setForm({ subject: "", title: "", description: "", duration_minutes: "" });
    loadTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه المهمة؟")) return;
    setDeletingId(id);
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="h1 text-theme-primary">مهام الـ 30 يوم</h1>
        <p className="text-caption text-theme-secondary mt-1">حدّد المهام لكل طالب حسب رقم اليوم</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input max-w-xs" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <select className="input max-w-[150px]" value={dayNumber} onChange={(e) => setDayNumber(Number(e.target.value))}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>اليوم {d}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleAdd} className="card grid gap-3 sm:grid-cols-2">
        <input
          required
          className="input"
          placeholder="المادة (مثال: فيزياء)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <input
          required
          className="input"
          placeholder="المهمة المطلوبة"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="input sm:col-span-2"
          placeholder="تفاصيل إضافية (اختياري)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          min={5}
          className="input"
          placeholder="المدة بالدقائق (اختياري)"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={saving}
          loadingText="جاري الإضافة..."
          disabled={saving || !studentId}
        >
          + إضافة مهمة
        </Button>
        {error && <p className="text-caption font-bold text-coral-600 sm:col-span-2">{error}</p>}
      </form>

      {loading && <TableRowSkeleton count={4} />}

      {!loading && tasks.length === 0 && (
        <div className="card text-center text-body text-theme-secondary">لا يوجد مهام في هذا اليوم لهذا الطالب.</div>
      )}

      {!loading && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="badge">{task.subject}</span>
                  <span className="text-caption text-theme-secondary">{statusLabel[task.status]}</span>
                </div>
                <p className="font-bold text-theme-primary">{task.title}</p>
                {task.description && <p className="text-caption text-theme-secondary">{task.description}</p>}
              </div>
              <Button
                variant="danger"
                size="sm"
                isLoading={deletingId === task.id}
                loadingText="..."
                onClick={() => handleDelete(task.id)}
                className="shrink-0"
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
