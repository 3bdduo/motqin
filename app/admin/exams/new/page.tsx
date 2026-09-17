"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type DraftQuestion = { question_text: string; options: string[]; correct_option_index: number };

function emptyQuestion(): DraftQuestion {
  return { question_text: "", options: ["", "", "", ""], correct_option_index: 0 };
}

export default function NewExamPage() {
  const router = useRouter();
  const [meta, setMeta] = useState({ title: "", subject: "", exam_date: "", duration_minutes: "30" });
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(i: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx: number, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) } : q
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const q of questions) {
      if (!q.question_text.trim() || q.options.some((o) => !o.trim())) {
        setError("أكمل كل الأسئلة والاختيارات قبل الحفظ");
        return;
      }
    }

    setSaving(true);

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...meta,
        duration_minutes: Number(meta.duration_minutes),
        questions,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "حدث خطأ");
      return;
    }

    router.push("/admin/exams");
    router.refresh();
  }

  return (
    <div className="max-w-2xl animate-fade-up space-y-4 pb-10">
      <h1 className="h1 text-theme-primary">إنشاء امتحان شهري</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">عنوان الامتحان</label>
            <input
              required
              className="input"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              placeholder="مثال: امتحان شهر أكتوبر"
            />
          </div>
          <div>
            <label className="label">المادة</label>
            <input
              required
              className="input"
              value={meta.subject}
              onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="label">مدة الامتحان (دقيقة)</label>
            <input
              type="number"
              min={5}
              className="input"
              value={meta.duration_minutes}
              onChange={(e) => setMeta({ ...meta, duration_minutes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">موعد الامتحان</label>
            <input
              required
              type="datetime-local"
              className="input"
              value={meta.exam_date}
              onChange={(e) => setMeta({ ...meta, exam_date: e.target.value })}
            />
          </div>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="card space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-theme-primary">السؤال {i + 1}</p>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-caption font-bold text-coral-600 hover:text-coral-700 transition-colors duration-200 active:scale-95"
                >
                  حذف السؤال
                </button>
              )}
            </div>

            <input
              className="input"
              placeholder="نص السؤال"
              value={q.question_text}
              onChange={(e) => updateQuestion(i, { question_text: e.target.value })}
            />

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correct_option_index === optIdx}
                    onChange={() => updateQuestion(i, { correct_option_index: optIdx })}
                    className="accent-[#2563EB] dark:accent-[#C87A4B] h-4 w-4"
                  />
                  <input
                    className="input"
                    placeholder={`اختيار ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, optIdx, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="text-caption text-theme-secondary">اختر الدائرة بجانب الإجابة الصحيحة</p>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        >
          + إضافة سؤال
        </Button>

        {error && (
          <p className="rounded-xl bg-coral-50 border border-coral-200 px-3 py-2 text-body font-bold text-coral-700 dark:bg-coral-950/40 dark:border-coral-900/50 dark:text-coral-300">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={saving}
          loadingText="جاري الحفظ..."
          className="w-full"
        >
          حفظ الامتحان
        </Button>
      </form>
    </div>
  );
}
