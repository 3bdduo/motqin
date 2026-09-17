import { SupabaseClient } from "@supabase/supabase-js";
import { todayISO } from "@/lib/utils";
import type { Profile, Task, Exam, ExamResult, Quote } from "@/lib/types";

export interface AdminStats {
  studentsCount: number;
  todayTotal: number;
  todayDone: number;
  overdueCount: number;
  upcomingExams: number;
}

export interface StudentWeekStats {
  total: number;
  done: number;
}

interface CacheStore {
  admin: {
    stats: AdminStats | null;
    students: Profile[] | null;
    exams: Exam[] | null;
    quotes: Quote[] | null;
    fetchedAt: number;
  };
  student: {
    todayTasks: Task[] | null;
    overdueTasks: Task[] | null;
    exams: Exam[] | null;
    examResults: Record<string, ExamResult> | null;
    reportResults: (ExamResult & { exam: Exam })[] | null;
    weekStats: StudentWeekStats | null;
    quotes: Quote[] | null;
    fetchedAt: number;
  };
}

export const appCache: CacheStore = {
  admin: {
    stats: null,
    students: null,
    exams: null,
    quotes: null,
    fetchedAt: 0,
  },
  student: {
    todayTasks: null,
    overdueTasks: null,
    exams: null,
    examResults: null,
    reportResults: null,
    weekStats: null,
    quotes: null,
    fetchedAt: 0,
  },
};

// Listeners for subscribers who want to be notified when cache updates
type CacheListener = () => void;
const listeners = new Set<CacheListener>();

export function subscribeToCache(listener: CacheListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

// ═══════════════════════════════════════════════════
// ADMIN PREFETCH & CACHE
// ═══════════════════════════════════════════════════

let adminPrefetchPromise: Promise<void> | null = null;

export async function prefetchAllAdminData(supabase: SupabaseClient, force = false): Promise<void> {
  const now = Date.now();
  // Don't refetch if fetched within last 45 seconds unless forced
  if (!force && appCache.admin.fetchedAt && now - appCache.admin.fetchedAt < 45000) {
    return;
  }

  if (adminPrefetchPromise && !force) {
    return adminPrefetchPromise;
  }

  adminPrefetchPromise = (async () => {
    try {
      const today = todayISO();

      const [
        studentsRes,
        tasksRes,
        overdueRes,
        upcomingExamsRes,
        examsRes,
        quotesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
        supabase.from("tasks").select("status").eq("due_date", today),
        supabase.from("tasks").select("id", { count: "exact", head: true }).lt("due_date", today).neq("status", "completed"),
        supabase.from("exams").select("id", { count: "exact", head: true }).gte("exam_date", new Date().toISOString()),
        supabase.from("exams").select("*").order("exam_date", { ascending: false }),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      ]);

      const students = (studentsRes.data as Profile[]) ?? [];
      const todayList = tasksRes.data ?? [];
      const exams = (examsRes.data as Exam[]) ?? [];
      const quotes = (quotesRes.data as Quote[]) ?? [];

      appCache.admin.students = students;
      appCache.admin.exams = exams;
      appCache.admin.quotes = quotes;

      appCache.admin.stats = {
        studentsCount: students.length,
        todayTotal: todayList.length,
        todayDone: todayList.filter((t) => t.status === "completed").length,
        overdueCount: overdueRes.count ?? 0,
        upcomingExams: upcomingExamsRes.count ?? 0,
      };

      appCache.admin.fetchedAt = Date.now();
      notifySubscribers();
    } catch (err) {
      console.error("Failed to prefetch admin data:", err);
    } finally {
      adminPrefetchPromise = null;
    }
  })();

  return adminPrefetchPromise;
}

// ═══════════════════════════════════════════════════
// STUDENT PREFETCH & CACHE
// ═══════════════════════════════════════════════════

let studentPrefetchPromise: Promise<void> | null = null;

export async function prefetchAllStudentData(supabase: SupabaseClient, userId: string, force = false): Promise<void> {
  const now = Date.now();
  if (!force && appCache.student.fetchedAt && now - appCache.student.fetchedAt < 45000) {
    return;
  }

  if (studentPrefetchPromise && !force) {
    return studentPrefetchPromise;
  }

  studentPrefetchPromise = (async () => {
    try {
      const today = todayISO();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().slice(0, 10);

      const [
        todayTasksRes,
        overdueTasksRes,
        examsRes,
        examResultsRes,
        reportResultsRes,
        weekTasksRes,
        quotesRes,
      ] = await Promise.all([
        supabase.from("tasks").select("*").eq("student_id", userId).eq("due_date", today).order("created_at", { ascending: true }),
        supabase.from("tasks").select("*").eq("student_id", userId).lt("due_date", today).neq("status", "completed").order("due_date", { ascending: false }),
        supabase.from("exams").select("*").order("exam_date", { ascending: false }),
        supabase.from("exam_results").select("*").eq("student_id", userId),
        supabase.from("exam_results").select("*, exam:exams(*)").eq("student_id", userId).order("taken_at", { ascending: true }),
        supabase.from("tasks").select("*").eq("student_id", userId).gte("due_date", weekAgoStr),
        supabase.from("quotes").select("text").eq("is_active", true),
      ]);

      const resultMap: Record<string, ExamResult> = {};
      (examResultsRes.data as ExamResult[] | null)?.forEach((r) => {
        resultMap[r.exam_id] = r;
      });

      const weekTasks = (weekTasksRes.data as Task[]) ?? [];

      appCache.student.todayTasks = (todayTasksRes.data as Task[]) ?? [];
      appCache.student.overdueTasks = ((overdueTasksRes.data as Task[]) ?? []).map((t) => ({
        ...t,
        status: "late" as const,
      }));
      appCache.student.exams = (examsRes.data as Exam[]) ?? [];
      appCache.student.examResults = resultMap;
      appCache.student.reportResults = (reportResultsRes.data as any) ?? [];
      appCache.student.weekStats = {
        total: weekTasks.length,
        done: weekTasks.filter((t) => t.status === "completed").length,
      };
      appCache.student.quotes = (quotesRes.data as Quote[]) ?? [];

      appCache.student.fetchedAt = Date.now();
      notifySubscribers();
    } catch (err) {
      console.error("Failed to prefetch student data:", err);
    } finally {
      studentPrefetchPromise = null;
    }
  })();

  return studentPrefetchPromise;
}

// ═══════════════════════════════════════════════════
// CACHE MUTATIONS / HELPERS
// ═══════════════════════════════════════════════════

export const cacheMutations = {
  removeStudent(id: string) {
    if (appCache.admin.students) {
      appCache.admin.students = appCache.admin.students.filter((s) => s.id !== id);
      if (appCache.admin.stats) {
        appCache.admin.stats.studentsCount = appCache.admin.students.length;
      }
      notifySubscribers();
    }
  },
  addStudent(student: Profile) {
    if (appCache.admin.students) {
      appCache.admin.students = [...appCache.admin.students, student].sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "ar")
      );
      if (appCache.admin.stats) {
        appCache.admin.stats.studentsCount = appCache.admin.students.length;
      }
      notifySubscribers();
    }
  },
  invalidateAdmin() {
    appCache.admin.fetchedAt = 0;
  },
  invalidateStudent() {
    appCache.student.fetchedAt = 0;
  },
  updateStudentTask(taskId: string, done: boolean) {
    const newStatus = done ? "completed" : "pending";
    if (appCache.student.todayTasks) {
      appCache.student.todayTasks = appCache.student.todayTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
    }
    if (appCache.student.overdueTasks) {
      if (done) {
        appCache.student.overdueTasks = appCache.student.overdueTasks.filter((t) => t.id !== taskId);
      }
    }
    notifySubscribers();
  },
};
