"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, StudentSettings } from "@/lib/types";

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

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    study_hours_per_day: "",
    lesson_schedule: "",
    notes: "",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
      const { data: s } = await supabase.from("student_settings").select("*").eq("student_id", id).single();

      setProfile(p as Profile);
      setSettings(s as StudentSettings);
      setForm({
        full_name: p?.full_name ?? "",
        phone: p?.phone ?? "",
        password: "",
        study_hours_per_day: s?.study_hours_per_day?.toString() ?? "",
        lesson_schedule: s?.lesson_schedule ?? "",
        notes: s?.notes ?? "",
      });
      setSubjects(s?.subjects ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleSubject(subject: string) {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone,
        ...(form.password ? { password: form.password } : {}),
        study_hours_per_day: form.study_hours_per_day ? Number(form.study_hours_per_day) : null,
        lesson_schedule: form.lesson_schedule,
        notes: form.notes,
        subjects,
      }),
    });

    setSaving(false);
    setMessage(res.ok ? "تم الحفظ بنجاح" : "حدث خطأ أثناء الحفظ");
  }

  async function handleDelete() {
    if (!confirm(`هل أنت متأكد من حذف الطالب ${profile?.full_name}؟ لا يمكن التراجع.`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/students");
  }

  if (loading) return <p className="text-sm text-ink-400">جاري التحميل...</p>;
  if (!profile) return <p className="text-sm text-ink-400">الطالب غير موجود</p>;

  return (
    <div className="max-w-xl animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">{profile.full_name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/reports/${id}`} className="btn-secondary">
            تقرير المستوى
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            حذف الطالب
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم الطالب</label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">رقم الهاتف</label>
            <input
              className="input"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">تغيير كلمة المرور (اختياري)</label>
          <input
            type="text"
            dir="ltr"
            className="input"
            placeholder="اتركه فارغًا لعدم التغيير"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          <label className="label">مواعيد الدروس</label>
          <textarea
            className="input min-h-20"
            value={form.lesson_schedule}
            onChange={(e) => setForm({ ...form, lesson_schedule: e.target.value })}
          />
        </div>

        <div>
          <label className="label">ملاحظات</label>
          <textarea
            className="input min-h-20"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {message && <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{message}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}
