"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "@/components/TaskCard";
import { CardSkeleton } from "@/components/Skeleton";
import type { Task } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { appCache, prefetchAllStudentData, subscribeToCache, cacheMutations } from "@/lib/dataCache";

export default function OverdueTasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>(() => appCache.student.overdueTasks ?? []);
  const [loading, setLoading] = useState<boolean>(() => !appCache.student.overdueTasks);

  useEffect(() => {
    if (appCache.student.overdueTasks) {
      setTasks(appCache.student.overdueTasks);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.student.overdueTasks) {
        setTasks(appCache.student.overdueTasks);
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

  async function handleToggle(id: string, done: boolean) {
    setTasks((prev) => (done ? prev.filter((t) => t.id !== id) : prev));
    await supabase
      .from("tasks")
      .update({
        status: done ? "completed" : "late",
        completed_at: done ? new Date().toISOString() : null,
      })
      .eq("id", id);
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm dark:border-[#332922] dark:bg-[#1D1713]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-coral-200 bg-coral-50 px-2.5 py-1 text-caption font-extrabold text-coral-800 dark:border-coral-900/50 dark:bg-coral-950/40 dark:text-coral-300">
              مهام تحتاج اهتمامك
            </div>
            <h1 className="mt-2 h1 text-theme-primary">
              المهام المتأخرة
            </h1>
            <p className="mt-1 text-caption font-bold text-theme-secondary leading-relaxed">
              راجع المهام دي مع الاستاذة اسراء حسن وخلصها واحدة بواحدة
            </p>
          </div>

          {!loading && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-coral-300 bg-coral-500 text-white font-black h3">
              {tasks.length}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={3} />
        </div>
      )}

      {/* Empty Victory State */}
      {!loading && tasks.length === 0 && (
        <div className="card text-center py-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] dark:border-[#332922] dark:bg-[#271F1A]">
            <div className="h-5 w-5 rounded-full bg-[#2563EB] dark:bg-[#C87A4B]" />
          </div>
          <h2 className="h3 text-theme-primary">
            لا توجد مهام متأخرة
          </h2>
          <p className="mt-1 text-caption font-bold text-[#2563EB] dark:text-[#E09F6E]">
            الاستاذة اسراء حسن فخورة بمتابعتك المنتظمة
          </p>
        </div>
      )}

      {/* Task List */}
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
  );
}
