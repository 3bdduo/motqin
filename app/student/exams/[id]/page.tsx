"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Exam, ExamResult } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type PublicQuestion = { id: string; question_text: string; options: string[]; order_index: number };

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [existingResult, setExistingResult] = useState<ExamResult | null>(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: examRow } = await supabase.from("exams").select("*").eq("id", id).single();
      const { data: questionRows } = await supabase
        .from("exam_questions")
        .select("id, question_text, options, order_index")
        .eq("exam_id", id)
        .order("order_index", { ascending: true });
      const { data: resultRow } = await supabase
        .from("exam_results")
        .select("*")
        .eq("exam_id", id)
        .eq("student_id", userData.user.id)
        .maybeSingle();

      setExam(examRow as Exam);
      setQuestions((questionRows as PublicQuestion[]) ?? []);
      setExistingResult(resultRow as ExamResult | null);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      setError("جاوب على كل الأسئلة قبل التسليم");
      return;
    }
    setError(null);
    setSubmitting(true);

    const orderedAnswers = questions.map((q) => answers[q.id]);

    const res = await fetch(`/api/exams/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: orderedAnswers }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("حدث خطأ أثناء التسليم، حاول مرة أخرى");
      return;
    }

    const result = await res.json();
    setExistingResult(result);
  }

  if (loading) return <p className="p-4 text-sm text-ink-400">جاري التحميل...</p>;
  if (!exam) return <p className="p-4 text-sm text-ink-400">الامتحان غير موجود</p>;

  if (existingResult) {
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => router.back()} className="text-sm font-bold text-brand-600 dark:text-brand-400">
          ← رجوع
        </button>
        <div className="card text-center">
          <p className="text-sm font-bold text-ink-500 dark:text-ink-400">{exam.title}</p>
          <p className="mt-3 text-4xl font-extrabold text-brand-600 dark:text-brand-400">
            {Math.round(existingResult.percentage)}%
          </p>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {existingResult.score} من {existingResult.total} إجابة صحيحة
          </p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => router.back()} className="text-sm font-bold text-brand-600 dark:text-brand-400">
          ← رجوع
        </button>
        <div className="card space-y-2 text-center">
          <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">{exam.subject}</span>
          <h1 className="text-lg font-extrabold text-ink-900 dark:text-white">{exam.title}</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">{formatDateTime(exam.exam_date)}</p>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            عدد الأسئلة: {questions.length} • المدة: {exam.duration_minutes} دقيقة
          </p>
          <button onClick={() => setStarted(true)} className="btn-primary mt-3 w-full">
            ابدأ الامتحان
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up pb-6">
      <h1 className="font-extrabold text-ink-900 dark:text-white">{exam.title}</h1>

      {questions.map((q, i) => (
        <div key={q.id} className="card">
          <p className="mb-3 font-bold text-ink-900 dark:text-white">
            {i + 1}. {q.question_text}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, optIdx) => (
              <label
                key={optIdx}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-ink-700 dark:has-[:checked]:bg-brand-900/20"
              >
                <input
                  type="radio"
                  name={q.id}
                  className="accent-brand-600"
                  checked={answers[q.id] === optIdx}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-bold text-coral-700 dark:bg-coral-900/30 dark:text-coral-300">
          {error}
        </p>
      )}

      <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
        {submitting ? "جاري التسليم..." : "تسليم الامتحان"}
      </button>
    </div>
  );
}
