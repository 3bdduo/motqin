"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  late: "bg-coral-50 text-coral-700 dark:bg-coral-900/30 dark:text-coral-300",
};

const statusLabel: Record<string, string> = {
  pending: "لسه ماذاكرتهاش",
  completed: "تم الإنجاز",
  late: "متأخرة",
};

export function TaskCard({ task, onToggle }: { task: Task; onToggle?: (id: string, done: boolean) => void }) {
  const [pending, setPending] = useState(false);
  const isDone = task.status === "completed";

  async function handleClick() {
    if (!onToggle || pending) return;
    setPending(true);
    await onToggle(task.id, !isDone);
    setPending(false);
  }

  return (
    <div className={cn("card flex items-start justify-between gap-3", isDone && "opacity-70")}>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            {task.subject}
          </span>
          <span className={cn("badge", statusStyles[task.status])}>{statusLabel[task.status]}</span>
        </div>
        <h3 className={cn("font-bold text-ink-900 dark:text-white", isDone && "line-through")}>
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{task.description}</p>
        )}
        {task.duration_minutes && (
          <p className="mt-1 text-xs font-bold text-ink-400 dark:text-ink-500">
            المدة المقترحة: {task.duration_minutes} دقيقة
          </p>
        )}
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          aria-pressed={isDone}
          aria-label={isDone ? "إلغاء الإنجاز" : "تم الإنجاز"}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg transition",
            isDone
              ? "border-brand-500 bg-brand-500 text-white animate-check-pop"
              : "border-ink-200 text-transparent hover:border-brand-400 dark:border-ink-700"
          )}
        >
          ✓
        </button>
      )}
    </div>
  );
}
