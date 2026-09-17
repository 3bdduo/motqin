"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import type { Exam, ExamResult } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type PublicQuestion = {
  id: string;
  question_text: string;
  options: string[];
  order_index: number;
};

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

      const { data: examRow } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();

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
      setError("يرجى الإجابة على كل الأسئلة قبل التسليم");
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
      setError("حدث خطأ أثناء التسليم، يرجى المحاولة مرة أخرى");
      return;
    }

    const result = await res.json();
    setExistingResult(result);
  }

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="card space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#332922] dark:bg-[#1D1713] space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-10 w-full rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="card text-center py-10">
        <p className="h3 font-bold text-theme-primary">
          الامتحان غير موجود
        </p>
        <button onClick={() => router.back()} className="btn-secondary mt-4">
          الرجوع للامتحانات
        </button>
      </div>
    );
  }

  // Result screen
  if (existingResult) {
    const percent = Math.round(existingResult.percentage);
    const isGreat = percent >= 80;
    const isGood = percent >= 50;

    return (
      <div className="space-y-5 animate-fade-up">
        <button
          onClick={() => router.push("/student/exams")}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#475569] hover:text-[#2563EB] dark:text-[#A3968B] dark:hover:text-[#E09F6E] transition-colors duration-200"
        >
          <span>الرجوع لقائمة الامتحانات</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center shadow-sm dark:border-[#332922] dark:bg-[#1D1713] transition-all duration-300">
          {/* Teacher Branding */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-1 text-xs font-black text-[#1E40AF] dark:border-[#4D3E35] dark:bg-[#3A2B22] dark:text-[#E09F6E]">
            <span>الاستاذة اسراء حسن</span>
          </div>

          <h2 className="h1 text-theme-primary">
            {exam.title}
          </h2>
          <p className="mt-1 text-caption font-bold text-theme-secondary">{exam.subject}</p>

          <div className="my-6 rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] p-5 dark:border-[#332922] dark:bg-[#271F1A]">
            <span
              className={`text-4xl font-black ${
                isGreat
                  ? "text-[#2563EB] dark:text-[#C87A4B]"
                  : isGood
                  ? "text-[#2563EB] dark:text-[#C87A4B]"
                  : "text-coral-500"
              }`}
            >
              {percent}٪
            </span>
            <p className="mt-1.5 text-caption font-extrabold text-theme-secondary">
              أجبت عن {existingResult.score} من أصل {existingResult.total} أسئلة بشكل صحيح
            </p>
          </div>

          <p className="text-body font-bold text-theme-primary leading-relaxed">
            {isGreat
              ? "مستوى ممتاز واستيعاب عالي جداً. بارك الله في جهدك."
              : isGood
              ? "أداء طيب، ومع المراجعة المنتظمة ستصل للدرجة النهائية."
              : "فرصة رائعة للمراجعة والتركيز على النقاط غير المفهومة مع المعلمة."}
          </p>

          <button
            onClick={() => router.push("/student/reports")}
            className="btn-primary mt-6 w-full"
          >
            عرض تقرير الدرجات
          </button>
        </div>
      </div>
    );
  }

  // Pre-exam intro screen
  if (!started) {
    return (
      <div className="space-y-5 animate-fade-up">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-500 hover:text-brand-600 transition-colors duration-350"
        >
          <span>رجوع</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center shadow-sm dark:border-[#332922] dark:bg-[#1D1713] transition-all duration-300">
          {/* Teacher Tag */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-1 text-xs font-black text-[#1E40AF] dark:border-[#4D3E35] dark:bg-[#3A2B22] dark:text-[#E09F6E]">
            <span>الاستاذة اسراء حسن</span>
          </div>

          <div className="mt-2">
            <span className="badge">
              {exam.subject}
            </span>
          </div>

          <h1 className="mt-2 h1 text-theme-primary">
            {exam.title}
          </h1>
          <p className="mt-1 text-caption font-bold text-theme-secondary">
            {formatDateTime(exam.exam_date)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-right">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] p-3.5 dark:border-[#332922] dark:bg-[#271F1A]">
              <p className="text-caption font-bold text-theme-secondary">عدد الأسئلة</p>
              <p className="mt-1 h3 text-theme-primary">
                {questions.length} أسئلة
              </p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] p-3.5 dark:border-[#332922] dark:bg-[#271F1A]">
              <p className="text-caption font-bold text-theme-secondary">المدة المقترحة</p>
              <p className="mt-1 h3 text-theme-primary">
                {exam.duration_minutes} دقيقة
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#EFF6FF] border border-[#CBD5E1] p-3.5 text-right text-xs font-bold text-[#0F172A] dark:bg-[#271F1A] dark:border-[#4D3E35] dark:text-[#F5F0EB]">
            تنبيه: اقرأ كل سؤال بهدوء وركز قبل اختيار الإجابة المناسبة.
          </div>

          <button
            onClick={() => setStarted(true)}
            className="btn-primary mt-6 w-full py-3.5 text-base"
          >
            بدء الامتحان
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const answeredPercent = Math.round((answeredCount / questions.length) * 100);

  // Active exam questions
  return (
    <div className="space-y-5 animate-fade-up pb-8">
      {/* Sticky Progress Header */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-sm backdrop-blur-md dark:border-[#332922] dark:bg-[#1D1713] transition-all duration-300">
        <div className="flex items-center justify-between text-xs font-extrabold">
          <span className="text-[#0F172A] dark:text-[#F5F0EB] truncate max-w-[200px]">
            {exam.title}
          </span>
          <span className="text-[#2563EB] dark:text-[#E09F6E]">
            {answeredCount} من {questions.length} أسئلة
          </span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EFF6FF] dark:bg-[#271F1A]">
          <div
            className="h-full rounded-full bg-[#2563EB] dark:bg-[#C87A4B] transition-all duration-500"
            style={{ width: `${answeredPercent}%` }}
          />
        </div>
      </div>

      {/* Question Cards */}
      {questions.map((q, i) => {
        const isAnswered = answers[q.id] !== undefined;

        return (
          <div
            key={q.id}
            className={`rounded-2xl border p-4.5 transition-all duration-300 shadow-sm bg-[#F8FAFC] dark:bg-[#1D1713] ${
              isAnswered
                ? "border-[#2563EB]/60 dark:border-[#C87A4B]/60"
                : "border-[#E2E8F0] dark:border-[#332922]"
            }`}
          >
            <div className="flex items-start gap-2.5 mb-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-xs font-black text-[#2563EB] dark:bg-[#271F1A] dark:text-[#E09F6E]">
                {i + 1}
              </span>
              <h2 className="font-extrabold text-body leading-relaxed text-theme-primary pt-0.5">
                {q.question_text}
              </h2>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;

                return (
                  <label
                    key={optIdx}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all duration-200 active:scale-[0.99] ${
                      isSelected
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#0F172A] dark:border-[#C87A4B] dark:bg-[#271F1A] dark:text-[#F5F0EB]"
                        : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] dark:border-[#332922] dark:bg-[#14100D] dark:text-[#A3968B] dark:hover:border-[#4D3E35]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={q.id}
                        className="accent-[#2563EB] dark:accent-[#C87A4B] h-4 w-4"
                        checked={isSelected}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                        }
                      />
                      <span>{opt}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[#2563EB] dark:text-[#E09F6E] text-xs font-black">
                        ✓
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <div className="rounded-2xl bg-coral-50 border border-coral-200 p-3.5 text-center text-xs font-black text-coral-700 dark:bg-coral-950/40 dark:border-coral-800 dark:text-coral-300">
          {error}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        isLoading={submitting}
        loadingText="جاري تسجيل النتيجة..."
        onClick={handleSubmit}
        className="w-full py-3.5"
      >
        تسليم الامتحان
      </Button>
    </div>
  );
}
