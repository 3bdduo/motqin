"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { prefetchAllAdminData, prefetchAllStudentData } from "@/lib/dataCache";

export function AdminDataPrefetcher() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Prefetch all Admin API data immediately into memory cache
    prefetchAllAdminData(supabase);

    // 2. Prefetch Next.js route bundles so route changes happen in <50ms
    const routes = [
      "/admin",
      "/admin/students",
      "/admin/students/new",
      "/admin/tasks",
      "/admin/exams",
      "/admin/exams/new",
      "/admin/quotes",
    ];

    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function StudentDataPrefetcher({ userId }: { userId?: string }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Prefetch all Student API data
    async function init() {
      let uid = userId;
      if (!uid) {
        const { data } = await supabase.auth.getUser();
        uid = data.user?.id;
      }
      if (uid) {
        prefetchAllStudentData(supabase, uid);
      }
    }
    init();

    // 2. Prefetch student routes
    const routes = [
      "/student",
      "/student/overdue",
      "/student/exams",
      "/student/reports",
    ];

    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
}
