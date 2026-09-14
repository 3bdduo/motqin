import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;

  return { supabase, user };
}

export async function POST(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { supabase, user } = ctx;

  const body = await request.json();
  const { student_id, subject, title, description, duration_minutes, due_date } = body;

  if (!student_id || !subject || !title || !due_date) {
    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      student_id,
      subject,
      title,
      description: description ?? null,
      duration_minutes: duration_minutes ?? null,
      due_date,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("notifications").insert({
    student_id,
    message: `تمت إضافة مهمة جديدة: ${title}`,
    type: "task",
  });

  return NextResponse.json(data);
}
