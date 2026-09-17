"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuoteBanner } from "@/components/QuoteBanner";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCard } from "@/components/TaskCard";
import { LogoSpinner } from "@/components/LogoSpinner";
import { CardSkeleton } from "@/components/Skeleton";
import type { Task, Quote } from "@/lib/types";
import { todayISO, formatDate } from "@/lib/utils";
import { appCache, prefetchAllStudentData, subscribeToCache, cacheMutations } from "@/lib/dataCache";

export default function StudentHomePage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>(() => appCache.student.currentDayTasks ?? []);
  const [currentDay, setCurrentDay] = useState<number>(() => appCache.student.currentDay ?? 1);
  const [stats, setStats] = useState(() => appCache.student.stats ?? { totalTasks: 0, completedTasks: 0, currentDay: 1 });
  const [quote, setQuote] = useState<string>(() => {
    if (appCache.student.quotes && appCache.student.quotes.length > 0) {
      const idx = new Date().getDate() % appCache.student.quotes.length;
      return appCache.student.quotes[idx].text;
    }
    return "يوم جديد، وفرصة جديدة تقربك من حلمك. الإتقان طريق من درجات.";
  });
  const [loading, setLoading] = useState<boolean>(() => !appCache.student.todayTasks);

  useEffect(() => {
    if (appCache.student.currentDayTasks) {
      setTasks(appCache.student.currentDayTasks);
      setCurrentDay(appCache.student.currentDay);
      setStats(appCache.student.stats!);
      setLoading(false);
    }
    if (appCache.student.quotes && appCache.student.quotes.length > 0) {
      const idx = new Date().getDate() % appCache.student.quotes.length;
      setQuote(appCache.student.quotes[idx].text);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.student.currentDayTasks) {
        setTasks(appCache.student.currentDayTasks);
        setCurrentDay(appCache.student.currentDay);
        setStats(appCache.student.stats!);
        setLoading(false);
      }
      if (appCache.student.quotes && appCache.student.quotes.length > 0) {
        const idx = new Date().getDate() % appCache.student.quotes.length;
        setQuote(appCache.student.quotes[idx].text);
      }
    });

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        prefetchAllStudentData(supabase, data.user.id);
      }
    });

    return unsubscribe;
  }, []);

  async function handleToggle(id: string, done: boolean) {
    const newStatus = done ? "completed" : "pending";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    cacheMutations.updateStudentTask(id, done);
    await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: done ? new Date().toISOString() : null,
      })
      .eq("id", id);
  }

  const completed = tasks.filter((t) => t.status === "completed").length;
  const percent =
    tasks.length === 0 ? 0 : (completed / tasks.length) * 100;
  const isAllDone = tasks.length > 0 && completed === tasks.length;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Motivational Quote from the Teacher */}
      <QuoteBanner text={quote} />

      {/* Teacher Branding Strip */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 dark:border-[#332922] dark:bg-[#1D1713] transition-all duration-300">
        <div className="h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#C87A4B]" />
        <p className="text-caption font-extrabold text-theme-primary tracking-wide">
          مُتقِن — منصة الاستاذة اسراء حسن للإتقان والتفوق الاكاديمي
        </p>
      </div>

      {/* Daily Progress Card: Light #F8FAFC, Dark #1D1713 */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
        <div className="relative flex items-center justify-between gap-4">
          <div>
            {/* Date Tag: nested-div */}
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:border-[#332922] dark:bg-[#271F1A] dark:text-[#E09F6E]">
              اليوم {currentDay} من 30
            </div>

            <h2 className="mt-2 h2 text-theme-primary">
              انجازك الحالي
            </h2>

            <p className="mt-1 text-caption text-theme-secondary">
              انجزت{" "}
              <span className="font-black text-[#2563EB] dark:text-[#C87A4B] text-body-lg">
                {completed}
              </span>{" "}
              من اصل {tasks.length} مهام
            </p>

            {tasks.length > 0 && (
              <div
                className={[
                  "mt-2 rounded-lg px-2 py-0.5 inline-block text-[11px] font-black tracking-wide border transition-all duration-300",
                  isAllDone
                    ? "bg-[#DBEAFE] text-[#1E40AF] border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]"
                    : percent >= 50
                    ? "bg-[#DBEAFE] text-[#1E40AF] border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]"
                    : "bg-[#DBEAFE] text-[#1E40AF] border-[#CBD5E1] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]",
                ].join(" ")}
              >
                {isAllDone
                  ? "انجاز اسطوري اليوم"
                  : percent >= 50
                  ? "ممتاز، قربت تخلص"
                  : "بداية رائعة، كمل يا بطل"}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <ProgressRing percent={percent} size={94} />
          </div>
        </div>
      </div>

      {/* All Tasks Done Banner */}
      {isAllDone && (
        <div className="animate-bounce-in rounded-2xl border border-[#CBD5E1] bg-[#EFF6FF] p-4 text-center dark:border-[#4D3E35] dark:bg-[#271F1A]">
          <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-[#DBEAFE] flex items-center justify-center dark:bg-[#3A2B22]">
            <div className="h-3 w-3 rounded-full bg-[#2563EB] dark:bg-[#C87A4B]" />
          </div>
          <p className="font-black text-body text-theme-primary">
            رائع جداً! انهيت جميع مهام اليوم {currentDay} بنجاح
          </p>
          <p className="text-caption text-theme-secondary mt-1">
            اليوم التالي سيفتح قريباً — استمر يا بطل!
          </p>
        </div>
      )}

      {/* Tasks Section */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-black h3 text-theme-primary">
            <span>مهام اليوم {currentDay}</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-black text-[#2563EB] dark:bg-[#271F1A] dark:text-[#E09F6E]">
              {tasks.length}
            </span>
          </h3>
        </div>

        {/* Skeletons on Loading */}
        {loading && (
          <div className="space-y-3">
            <CardSkeleton count={3} />
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <div className="card text-center py-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] dark:border-[#332922] dark:bg-[#271F1A]">
              <div className="h-5 w-5 rounded-full bg-[#2563EB] dark:bg-[#C87A4B]" />
            </div>
            <p className="font-extrabold text-theme-primary h3">
              لا توجد مهام مضافة اليوم
            </p>
            <p className="mt-1 text-caption text-theme-secondary">
              تواصل مع الاستاذة اسراء حسن لإضافة مهامك
            </p>
          </div>
        )}

        {/* Task Cards */}
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              index={idx}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
