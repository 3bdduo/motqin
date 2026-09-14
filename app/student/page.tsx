"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuoteBanner } from "@/components/QuoteBanner";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCard } from "@/components/TaskCard";
import type { Task } from "@/lib/types";
import { todayISO, formatDate } from "@/lib/utils";

export default function StudentHomePage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState<string>("يوم جديد، وفرصة جديدة تقرّبك من حلمك. يلا نبدأ 💪");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const today = todayISO();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: taskRows } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", userData.user.id)
      .eq("due_date", today)
      .order("created_at", { ascending: true });

    setTasks((taskRows as Task[]) ?? []);

    const { data: quotes } = await supabase.from("quotes").select("text").eq("is_active", true);
    if (quotes && quotes.length > 0) {
      const idx = new Date().getDate() % quotes.length;
      setQuote(quotes[idx].text);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle(id: string, done: boolean) {
    const newStatus = done ? "completed" : "pending";
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at: done ? new Date().toISOString() : null })
      .eq("id", id);
  }

  const completed = tasks.filter((t) => t.status === "completed").length;
  const percent = tasks.length === 0 ? 0 : (completed / tasks.length) * 100;

  return (
    <div className="space-y-6 animate-fade-up">
      <QuoteBanner text={quote} />

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-500 dark:text-ink-400">{formatDate(todayISO())}</p>
          <p className="mt-1 text-lg font-extrabold text-ink-900 dark:text-white">إنجازك اليوم</p>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {completed} من {tasks.length} مهام
          </p>
        </div>
        <ProgressRing percent={percent} size={92} />
      </div>

      <div>
        <h2 className="mb-3 font-extrabold text-ink-900 dark:text-white">تاسكات اليوم 📚</h2>

        {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

        {!loading && tasks.length === 0 && (
          <div className="card text-center text-sm text-ink-400">
            مفيش تاسكات مضافة النهاردة. تابع مع المشرف.
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
