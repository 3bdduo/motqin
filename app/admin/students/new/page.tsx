"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

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
    if (loading) return;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...form,
          study_hours_per_day: form.study_hours_per_day ? Number(form.study_hours_per_day) : null,
          subjects,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "حدث خطأ أثناء إنشاء حساب الطالب");
        setLoading(false);
        return;
      }

      // Invalidate admin cache so students list shows the new student immediately
      const { cacheMutations } = await import("@/lib/dataCache");
      cacheMutations.invalidateAdmin();

      router.push("/admin/students");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        setError("استغرقت العملية وقتاً أطول من المتوقع، يرجى المحاولة مرة أخرى.");
      } else {
        setError("تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl animate-fade-up space-y-4">
      <h1 className="h1 text-theme-primary">إضافة طالب جديد</h1>

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
                className={`rounded-full border px-3 py-1.5 text-caption font-bold transition-all duration-200 ease-out active:scale-[0.96] ${
                  subjects.includes(subject)
                    ? "border-[#2563EB] bg-[#2563EB] text-white dark:border-[#C87A4B] dark:bg-[#C87A4B]"
                    : "border-[#CBD5E1] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] dark:border-[#4D3E35] dark:text-[#A3968B] dark:hover:border-[#C87A4B] dark:hover:text-[#E09F6E]"
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
          <p className="rounded-xl bg-coral-50 border border-coral-200 px-3 py-2 text-caption font-black text-coral-700 dark:bg-coral-950/40 dark:border-coral-900/50 dark:text-coral-300">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          loadingText="جاري الإضافة..."
          className="w-full"
        >
          إضافة الطالب
        </Button>
      </form>
    </div>
  );
}
