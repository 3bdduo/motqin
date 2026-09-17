"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ButtonSpinner } from "@/components/Button";

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]",
  completed:
    "bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE] dark:bg-[#3A2B22] dark:text-[#E09F6E] dark:border-[#4D3E35]",
  late:
    "bg-coral-50 text-coral-800 border border-coral-200 dark:bg-[#3A2B22] dark:text-coral-300 dark:border-[#4D3E35]",
};

const statusLabel: Record<string, string> = {
  pending: "قيد المذاكرة",
  completed: "تم الانجاز",
  late: "متأخرة",
};

// Left accent bar color per status
const accentBar: Record<string, string> = {
  pending: "bg-amber-400 dark:bg-amber-500",
  completed: "bg-[#2563EB] dark:bg-[#C87A4B]",
  late: "bg-coral-500 dark:bg-coral-400",
};

export function TaskCard({
  task,
  onToggle,
  index = 0,
}: {
  task: Task;
  onToggle?: (id: string, done: boolean) => void;
  index?: number;
}) {
  const [pending, setPending] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const isDone = task.status === "completed";

  async function handleClick() {
    if (!onToggle || pending) return;
    setPending(true);
    const nextDone = !isDone;
    if (nextDone) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 800);
    }
    await onToggle(task.id, nextDone);
    setPending(false);
  }

  return (
    <div
      style={{ animationDelay: `${index * 0.07}s` }}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border transition-all duration-300",
        // Card/Inner-div: Light #F8FAFC, Dark #1D1713; Border: Light #E2E8F0, Dark #332922
        "bg-[#F8FAFC] dark:bg-[#1D1713] border-[#E2E8F0] dark:border-[#332922] shadow-sm hover:shadow-md hover:-translate-y-0.5",
        isDone && "opacity-80"
      )}
    >
      {/* Left Colored Accent Bar */}
      <div
        className={cn(
          "w-1 shrink-0 rounded-r-full transition-all duration-300",
          accentBar[task.status] ?? "bg-[#E2E8F0] dark:bg-[#332922]",
          isDone ? "opacity-60" : "opacity-100"
        )}
      />

      <div className="flex flex-1 items-start justify-between gap-3.5 p-4">
        <div className="min-w-0 flex-1">
          {/* Badges Row */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {/* Subject Badge: Light bg #DBEAFE, text #1E40AF; Dark bg #3A2B22, text #E09F6E */}
            <span className="badge text-[11px] font-black">
              {task.subject}
            </span>
            <span className={cn("badge text-[11px]", statusStyles[task.status])}>
              {statusLabel[task.status]}
            </span>
          </div>

          {/* Title: Light text-primary #0F172A; Dark text-primary #F5F0EB */}
          <h3
            className={cn(
              "font-extrabold text-base leading-snug transition-colors duration-200",
              isDone
                ? "text-[#475569] line-through dark:text-[#A3968B]"
                : "text-[#0F172A] dark:text-[#F5F0EB]"
            )}
          >
            {task.title}
          </h3>

          {/* Description: Light text-secondary #475569; Dark text-secondary #A3968B */}
          {task.description && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium leading-relaxed",
                isDone
                  ? "text-[#475569]/70 dark:text-[#A3968B]/70"
                  : "text-[#475569] dark:text-[#A3968B]"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Duration Badge / Micro Div: Light #EFF6FF, Dark #271F1A */}
          {task.duration_minutes && (
            <div className="mt-2.5">
              <span className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#475569] dark:border-[#332922] dark:bg-[#271F1A] dark:text-[#A3968B]">
                {task.duration_minutes} دقيقة
              </span>
            </div>
          )}
        </div>

        {/* Checkbox / Toggle Button */}
        {onToggle && (
          <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            aria-busy={pending}
            aria-pressed={isDone}
            aria-label={isDone ? "الغاء الانجاز" : "تم الانجاز"}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-black transition-all duration-200 ease-out active:scale-90",
              pending && "opacity-75 cursor-not-allowed",
              isDone
                ? "bg-[#2563EB] text-white border-[#2563EB] dark:bg-[#C87A4B] dark:border-[#C87A4B] dark:text-white"
                : "bg-[#EFF6FF] text-transparent border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB] dark:bg-[#271F1A] dark:border-[#4D3E35] dark:text-transparent dark:hover:border-[#C87A4B] dark:hover:text-[#E09F6E]",
              justCompleted && "animate-check-pop"
            )}
          >
            {pending ? (
              <ButtonSpinner className={isDone ? "text-white h-4 w-4" : "text-[#2563EB] dark:text-[#E09F6E] h-4 w-4"} />
            ) : (
              <span
                className={cn(
                  "text-base transition-transform duration-200",
                  isDone ? "scale-100" : "scale-75"
                )}
              >
                ✓
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
