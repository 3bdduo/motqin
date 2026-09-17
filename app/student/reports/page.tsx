"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCardSkeleton, TableRowSkeleton, Skeleton } from "@/components/Skeleton";
import type { Exam, ExamResult, Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { appCache, prefetchAllStudentData, subscribeToCache } from "@/lib/dataCache";

function getSubjectColorClass(subject?: string) {
  // Strict tokens: Light bg #DBEAFE, text #1E40AF; Dark bg #3A2B22, text #E09F6E
  return "bg-[#DBEAFE] text-[#1E40AF] border border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]";
}

export default function StudentReportsPage() {
  const supabase = createClient();
  const [results, setResults] = useState<(ExamResult & { exam: Exam })[]>(() => appCache.student.reportResults ?? []);
  const [stats, setStats] = useState(() => appCache.student.stats ?? { totalTasks: 0, completedTasks: 0, currentDay: 1 });
  const [loading, setLoading] = useState<boolean>(() => !appCache.student.reportResults);

  useEffect(() => {
    if (appCache.student.reportResults && appCache.student.stats) {
      setResults(appCache.student.reportResults);
      setStats(appCache.student.stats);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.student.reportResults && appCache.student.stats) {
        setResults(appCache.student.reportResults);
        setStats(appCache.student.stats);
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

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <StatsCardSkeleton count={2} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <TableRowSkeleton count={3} />
        </div>
      </div>
    );
  }

  const weekPercent =
    stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100);
  const lastResult = results[results.length - 1];
  const prevResult = results[results.length - 2];
  const trend =
    lastResult && prevResult ? lastResult.percentage - prevResult.percentage : null;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm dark:bg-[#C87A4B]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 19V10M12 19V5M19 19v-7" />
            </svg>
          </div>
          <div>
            <h1 className="h1 text-theme-primary">
              لوحة انجازاتي
            </h1>
            <p className="mt-0.5 text-caption font-bold text-theme-secondary">
              الاستاذة اسراء حسن — تابع تطور مستواك
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weekly Progress */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
          <p className="text-caption font-extrabold text-theme-secondary">إجمالي المهام</p>
          <p className="mt-2 h2 text-[#2563EB] dark:text-[#C87A4B]">
            {weekPercent}٪
          </p>
          <p className="mt-1 text-caption font-bold text-theme-secondary">
            {stats.completedTasks} من اصل {stats.totalTasks}
          </p>
        </div>

        {/* Latest Exam */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
          <p className="text-caption font-extrabold text-theme-secondary">آخر امتحان</p>
          <p className="mt-2 h2 text-theme-primary">
            {lastResult ? `${Math.round(lastResult.percentage)}٪` : "—"}
          </p>
          {trend !== null ? (
            <p className={`mt-1 text-caption font-extrabold ${trend >= 0 ? "text-[#2563EB] dark:text-[#C87A4B]" : "text-coral-600 dark:text-coral-400"}`}>
              {trend >= 0 ? "تحسن" : "انخفاض"} {Math.abs(Math.round(trend))}٪
            </p>
          ) : (
            <p className="mt-1 text-caption font-bold text-theme-secondary">
              {lastResult ? "اول اختبار" : "لم تؤد امتحانات"}
            </p>
          )}
        </div>
      </div>

      {/* Exam History */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-black h3 text-theme-primary">
            <span>سجل الامتحانات</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-black text-[#2563EB] dark:bg-[#271F1A] dark:text-[#E09F6E]">
              {results.length}
            </span>
          </h2>
          <p className="text-caption font-bold text-theme-secondary">الاستاذة اسراء حسن</p>
        </div>

        {results.length === 0 && (
          <div className="card text-center py-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] dark:border-[#332922] dark:bg-[#271F1A]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#2563EB] dark:text-[#E09F6E]">
                <path d="M5 19V10M12 19V5M19 19v-7" />
              </svg>
            </div>
            <p className="h3 text-theme-primary">
              لم تؤد اي امتحان حتى الآن
            </p>
            <p className="mt-1 text-caption text-theme-secondary">
              بعد تسليم اول امتحان ستظهر تحليلاتك هنا
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {[...results].reverse().map((r, idx) => {
            const percent = Math.round(r.percentage);

            return (
              <div
                key={r.id}
                style={{ animationDelay: `${idx * 0.07}s` }}
                className="group rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-[#332922] dark:bg-[#1D1713]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`badge text-[11px] ${getSubjectColorClass(r.exam?.subject)}`}>
                        {r.exam?.subject}
                      </span>
                    </div>
                    <p className="font-extrabold text-body text-theme-primary truncate">
                      {r.exam?.title}
                    </p>
                    <p className="mt-0.5 text-caption font-medium text-theme-secondary">
                      {formatDate(r.taken_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Mini progress bar */}
                    <div className="h-2.5 w-20 overflow-hidden rounded-full bg-[#EFF6FF] dark:bg-[#271F1A]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#2563EB] dark:bg-[#C87A4B]"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <span className="badge text-xs font-black min-w-[48px] justify-center">
                      {percent}٪
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
