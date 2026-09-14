"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBJECT_OPTIONS = [
  "عربي",
  "إنجليزي",
  "رياضة",
  "فيزياء",
  "كيمياء",
  "أحياء",
  "تاريخ",
  "جغرافيا",
  "فلسفة ومنطق",
  "علم نفس واجتماع",
  "لغة فرنسية",
  "لغة ألمانية",
];

export default function NewStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    study_hours_per_day: "",
    lesson_schedule: "",
    notes: "",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSubject(subject: string) {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        study_hours_per_day: form.study_hours_per_day ? Number(form.study_hours_per_day) : null,
        subjects,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "حدث خطأ");
      return;
    }

    router.push("/admin/students");
    router.refresh();
  }

  return (
    <div className="max-w-xl animate-fade-up space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">إضافة طالب جديد</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">اسم الطالب</label>
          <input
            required
            className="input"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">البريد الإلكتروني (لتسجيل الدخول)</label>
            <input
              required
              type="email"
              dir="ltr"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">كلمة المرور المبدئية</label>
            <input
              required
              type="text"
              dir="ltr"
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">رقم الهاتف (اختياري)</label>
          <input
            className="input"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="label">عدد ساعات المذاكرة يوميًا</label>
          <input
            type="number"
            min={0}
            step={0.5}
            className="input"
            value={form.study_hours_per_day}
            onChange={(e) => setForm({ ...form, study_hours_per_day: e.target.value })}
          />
        </div>

        <div>
          <label className="label">المواد الدراسية</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((subject) => (
              <button
                type="button"
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                  subjects.includes(subject)
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">مواعيد الدروس (نص حر)</label>
          <textarea
            className="input min-h-20"
            value={form.lesson_schedule}
            onChange={(e) => setForm({ ...form, lesson_schedule: e.target.value })}
            placeholder="مثال: فيزياء - السبت 5م، كيمياء - الاثنين 6م"
          />
        </div>

        <div>
          <label className="label">ملاحظات عن نظام مذاكرة الطالب</label>
          <textarea
            className="input min-h-20"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-bold text-coral-700 dark:bg-coral-900/30 dark:text-coral-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جاري الإضافة..." : "إضافة الطالب"}
        </button>
      </form>
    </div>
  );
}
