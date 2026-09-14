"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/utils";

type Stats = {
  studentsCount: number;
  todayTotal: number;
  todayDone: number;
  overdueCount: number;
  upcomingExams: number;
};

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const today = todayISO();

      const [{ count: studentsCount }, todayTasks, { count: overdueCount }, { count: upcomingExams }] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
          supabase.from("tasks").select("status").eq("due_date", today),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .lt("due_date", today)
            .neq("status", "completed"),
          supabase
            .from("exams")
            .select("id", { count: "exact", head: true })
            .gte("exam_date", new Date().toISOString()),
        ]);

      const todayList = todayTasks.data ?? [];

      setStats({
        studentsCount: studentsCount ?? 0,
        todayTotal: todayList.length,
        todayDone: todayList.filter((t) => t.status === "completed").length,
        overdueCount: overdueCount ?? 0,
        upcomingExams: upcomingExams ?? 0,
      });
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    { label: "عدد الطلاب", value: stats?.studentsCount, href: "/admin/students", tone: "brand" },
    {
      label: "إنجاز اليوم",
      value: stats ? `${stats.todayDone}/${stats.todayTotal}` : undefined,
      href: "/admin/tasks",
      tone: "amber",
    },
    { label: "مهام متأخرة", value: stats?.overdueCount, href: "/admin/tasks", tone: "coral" },
    { label: "امتحانات قادمة", value: stats?.upcomingExams, href: "/admin/exams", tone: "brand" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">نظرة عامة</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">متابعة سريعة لكل الطلاب اليوم</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card">
            <p className="text-xs font-bold text-ink-400">{c.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">
              {c.value === undefined ? "—" : c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/admin/students" className="card">
          <h3 className="font-bold text-ink-900 dark:text-white">إضافة طالب جديد</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            حدّد نظام مذاكرته ومواده وساعاته
          </p>
        </Link>
        <Link href="/admin/tasks" className="card">
          <h3 className="font-bold text-ink-900 dark:text-white">إضافة تاسكات اليوم</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">وزّع المهام على كل طالب</p>
        </Link>
        <Link href="/admin/exams" className="card">
          <h3 className="font-bold text-ink-900 dark:text-white">إنشاء امتحان شهري</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            قيّم مستوى الطلاب في نهاية الشهر
          </p>
        </Link>
      </div>
    </div>
  );
}
