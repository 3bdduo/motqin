"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { StatsCardSkeleton } from "@/components/Skeleton";
import { todayISO } from "@/lib/utils";
import { appCache, prefetchAllAdminData, subscribeToCache } from "@/lib/dataCache";

type Stats = {
  studentsCount: number;
  todayTotal: number;
  todayDone: number;
  overdueCount: number;
  upcomingExams: number;
};

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(() => appCache.admin.stats);

  useEffect(() => {
    // If we have cached stats, display them immediately
    if (appCache.admin.stats) {
      setStats(appCache.admin.stats);
    }

    // Subscribe to cache updates
    const unsubscribe = subscribeToCache(() => {
      if (appCache.admin.stats) {
        setStats(appCache.admin.stats);
      }
    });

    // Revalidate in background
    prefetchAllAdminData(supabase);

    return unsubscribe;
  }, []);

  const cards = [
    { label: "عدد الطلاب", value: stats?.studentsCount, href: "/admin/students" },
    {
      label: "إنجاز اليوم",
      value: stats ? `${stats.todayDone}/${stats.todayTotal}` : undefined,
      href: "/admin/tasks",
    },
    { label: "مهام متأخرة", value: stats?.overdueCount, href: "/admin/tasks" },
    { label: "امتحانات قادمة", value: stats?.upcomingExams, href: "/admin/exams" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="h1 text-theme-primary">نظرة عامة</h1>
        <p className="text-caption text-theme-secondary mt-1">متابعة سريعة لكل الطلاب اليوم</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatsCardSkeleton count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="card active:scale-[0.98] transition-all duration-200 ease-out"
            >
              <p className="text-caption text-theme-secondary">{c.label}</p>
              <p className="mt-2 h2 text-theme-primary">
                {c.value === undefined ? "—" : c.value}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/admin/students/new" className="card active:scale-[0.98] transition-all duration-200 ease-out">
          <h3 className="h3 text-theme-primary">إضافة طالب جديد</h3>
          <p className="mt-1 text-caption text-theme-secondary">
            حدّد نظام مذاكرته ومواده وساعاته
          </p>
        </Link>
        <Link href="/admin/tasks" className="card active:scale-[0.98] transition-all duration-200 ease-out">
          <h3 className="h3 text-theme-primary">إضافة تاسكات اليوم</h3>
          <p className="mt-1 text-caption text-theme-secondary">وزّع المهام على كل طالب</p>
        </Link>
        <Link href="/admin/exams" className="card active:scale-[0.98] transition-all duration-200 ease-out">
          <h3 className="h3 text-theme-primary">إنشاء امتحان شهري</h3>
          <p className="mt-1 text-caption text-theme-secondary">
            قيّم مستوى الطلاب في نهاية الشهر
          </p>
        </Link>
      </div>
    </div>
  );
}
