"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoSpinner } from "@/components/LogoSpinner";
import { CardSkeleton } from "@/components/Skeleton";
import type { Exam, ExamResult } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { appCache, prefetchAllStudentData, subscribeToCache } from "@/lib/dataCache";

// Subject color (no emoji)
function getSubjectColorClass(subject: string) {
  // Strict badge tokens: Light bg #DBEAFE, text #1E40AF; Dark bg #3A2B22, text #E09F6E
  return "bg-[#DBEAFE] text-[#1E40AF] border border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]";
}

export default function StudentExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>(() => appCache.student.exams ?? []);
  const [results, setResults] = useState<Record<string, ExamResult>>(() => appCache.student.examResults ?? {});
  const [loading, setLoading] = useState<boolean>(() => !appCache.student.exams);

  useEffect(() => {
    if (appCache.student.exams && appCache.student.examResults) {
      setExams(appCache.student.exams);
      setResults(appCache.student.examResults);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.student.exams && appCache.student.examResults) {
        setExams(appCache.student.exams);
        setResults(appCache.student.examResults);
        setLoading(false);
      }
    });

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        prefetchAllStudentData(supabase, data.user.id);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm dark:bg-[#C87A4B]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="4.5" y="4" width="15" height="16" rx="2" />
              <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
            </svg>
          </div>
          <div>
            <h1 className="h1 text-theme-primary">
              الامتحانات الشهرية
            </h1>
            <p className="mt-0.5 text-caption font-bold text-theme-secondary">
              الاستاذة اسراء حسن — اختبر مستواك
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <CardSkeleton count={3} />
        </div>
      )}

      {/* Empty State */}
      {!loading && exams.length === 0 && (
        <div className="card text-center py-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] dark:border-[#332922] dark:bg-[#271F1A]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#2563EB] dark:text-[#E09F6E]">
              <rect x="4.5" y="4" width="15" height="16" rx="2" />
              <path d="M8.5 9h7M8.5 13h7" />
            </svg>
          </div>
          <p className="font-extrabold text-theme-primary h3">
            لا توجد امتحانات حالياً
          </p>
          <p className="mt-1 text-caption text-theme-secondary">
            ستضاف امتحانات الاستاذة اسراء حسن في مواعيدها
          </p>
        </div>
      )}

      {/* Exams List */}
      <div className="space-y-3">
        {exams.map((exam, idx) => {
          const result = results[exam.id];
          const isPast = new Date(exam.exam_date).getTime() < Date.now();
          const percent = result ? Math.round(result.percentage) : null;

          return (
            <Link
              key={exam.id}
              href={`/student/exams/${exam.id}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
              className="group block rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4.5 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] active:scale-[0.98] dark:border-[#332922] dark:bg-[#1D1713]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Subject & Duration Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`badge text-[11px] ${getSubjectColorClass(exam.subject)}`}>
                      {exam.subject}
                    </span>
                    <span className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#475569] dark:border-[#332922] dark:bg-[#271F1A] dark:text-[#A3968B]">
                      {exam.duration_minutes} دقيقة
                    </span>
                  </div>

                  <h2 className="mt-1.5 h3 font-black text-theme-primary transition-colors duration-200">
                    {exam.title}
                  </h2>

                  <p className="mt-1 text-caption font-medium text-theme-secondary">
                    {formatDateTime(exam.exam_date)}
                  </p>
                </div>

                {/* Result or Status Badge */}
                <div className="shrink-0">
                  {percent !== null ? (
                    <div className="text-right">
                      <span className="badge font-extrabold text-sm px-3 py-1.5 justify-center">
                        {percent}٪
                      </span>
                      <p className="mt-0.5 text-caption font-bold text-theme-secondary text-right">
                        تم التسليم
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={[
                          "badge text-[11px]",
                          isPast
                            ? "bg-coral-50 text-coral-700 border border-coral-200 dark:bg-coral-900/30 dark:text-coral-300"
                            : "bg-[#DBEAFE] text-[#1E40AF] border border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]",
                        ].join(" ")}
                      >
                        {isPast ? "لم يؤد" : "ابدأ الآن"}
                      </span>
                      <span className="text-theme-secondary font-bold transition-transform duration-200 group-hover:-translate-x-1">
                        ←
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
