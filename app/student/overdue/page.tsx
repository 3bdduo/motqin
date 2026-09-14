"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "@/components/TaskCard";
import type { Task } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export default function OverdueTasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", userData.user.id)
      .lt("due_date", todayISO())
      .neq("status", "completed")
      .order("due_date", { ascending: false });

    const withLateStatus = ((data as Task[]) ?? []).map((t) => ({ ...t, status: "late" as const }));
    setTasks(withLateStatus);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle(id: string, done: boolean) {
    setTasks((prev) => (done ? prev.filter((t) => t.id !== id) : prev));
    await supabase
      .from("tasks")
      .update({ status: done ? "completed" : "late", completed_at: done ? new Date().toISOString() : null })
      .eq("id", id);
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="font-extrabold text-ink-900 dark:text-white">المهام المتأخرة</h1>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        خلّص المهام دي الأول قبل ما تتراكم أكتر.
      </p>

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      {!loading && tasks.length === 0 && (
        <div className="card text-center text-sm text-brand-600 dark:text-brand-400">
          ولا مهمة متأخرة، تمام كده 🎉
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
