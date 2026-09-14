"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Task } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  pending: "لسه",
  completed: "منجزة",
  late: "متأخرة",
};

export default function AdminTasksPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Profile[]>([]);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ subject: "", title: "", description: "", duration_minutes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      const { data } = await supabase.from("profiles").select("*").eq("role", "student").order("full_name");
      setStudents((data as Profile[]) ?? []);
      if (data && data.length > 0) setStudentId(data[0].id);
    }
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTasks() {
    if (!studentId) return;
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", studentId)
      .eq("due_date", date)
      .order("created_at");
    setTasks((data as Task[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, date]);

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
        due_date: date,
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
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">التاسكات اليومية</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">حدّد المهام لكل طالب حسب يومه</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input max-w-xs" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <input type="date" className="input max-w-[180px]" value={date} onChange={(e) => setDate(e.target.value)} />
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
        <button type="submit" disabled={saving || !studentId} className="btn-primary">
          {saving ? "جاري الإضافة..." : "+ إضافة مهمة"}
        </button>
        {error && <p className="text-sm font-bold text-coral-600 sm:col-span-2">{error}</p>}
      </form>

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      {!loading && tasks.length === 0 && (
        <div className="card text-center text-sm text-ink-400">لا يوجد مهام في هذا اليوم لهذا الطالب.</div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                  {task.subject}
                </span>
                <span className="text-xs font-bold text-ink-400">{statusLabel[task.status]}</span>
              </div>
              <p className="font-bold text-ink-900 dark:text-white">{task.title}</p>
              {task.description && <p className="text-sm text-ink-500 dark:text-ink-400">{task.description}</p>}
            </div>
            <button onClick={() => handleDelete(task.id)} className="btn-danger shrink-0">
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
