"use client";

import Link from "next/link";

export default function OverdueTasksPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-coral-200 bg-coral-50 px-2.5 py-1 text-caption font-extrabold text-coral-800 dark:border-coral-900/50 dark:bg-coral-950/40 dark:text-coral-300">
              النظام المتسلسل
            </div>
            <h1 className="mt-2 h1 text-theme-primary">
              المهام المتأخرة
            </h1>
            <p className="mt-1 text-caption font-bold text-theme-secondary leading-relaxed">
              في نظام الـ 30 يوم المتسلسل، لا توجد مهام متأخرة بالمعنى التقليدي. 
              يجب عليك إنجاز مهام اليوم الحالي لتتمكن من الانتقال لليوم التالي.
            </p>
          </div>
        </div>
      </div>

      <div className="card text-center py-10">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] dark:border-[#332922] dark:bg-[#271F1A]">
          <div className="h-5 w-5 rounded-full bg-[#2563EB] dark:bg-[#C87A4B]" />
        </div>
        <h2 className="h3 text-theme-primary">
          عد إلى مهام اليوم
        </h2>
        <p className="mt-1 mb-4 text-caption font-bold text-[#2563EB] dark:text-[#E09F6E]">
          ركز على مهامك الحالية لتفتح المزيد!
        </p>
        <Link
          href="/student"
          className="inline-flex items-center justify-center rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2 text-caption font-bold text-white transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.96] dark:border-[#C87A4B] dark:bg-[#C87A4B] dark:hover:bg-[#B5693A]"
        >
          الذهاب لمهام اليوم
        </Link>
      </div>
    </div>
  );
}
