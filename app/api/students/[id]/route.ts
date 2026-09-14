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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await request.json();
  const { full_name, phone, password, study_hours_per_day, subjects, lesson_schedule, notes } = body;

  const adminClient = createAdminClient();

  if (full_name !== undefined || phone !== undefined) {
    await adminClient
      .from("profiles")
      .update({
        ...(full_name !== undefined && { full_name }),
        ...(phone !== undefined && { phone }),
      })
      .eq("id", params.id);
  }

  if (password) {
    const { error } = await adminClient.auth.admin.updateUserById(params.id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await adminClient
    .from("student_settings")
    .update({
      ...(study_hours_per_day !== undefined && { study_hours_per_day }),
      ...(subjects !== undefined && { subjects }),
      ...(lesson_schedule !== undefined && { lesson_schedule }),
      ...(notes !== undefined && { notes }),
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", params.id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
