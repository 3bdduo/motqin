import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;

  return user;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json();
  const { email, password, full_name, phone, study_hours_per_day, subjects, lesson_schedule, notes } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "تعذّر إنشاء الحساب" }, { status: 400 });
  }

  const studentId = created.user.id;

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: studentId,
    role: "student",
    full_name,
    phone: phone ?? null,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(studentId);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  await adminClient.from("student_settings").insert({
    student_id: studentId,
    study_hours_per_day: study_hours_per_day ?? null,
    subjects: subjects ?? [],
    lesson_schedule: lesson_schedule ?? null,
    notes: notes ?? null,
  });

  return NextResponse.json({ id: studentId });
}
