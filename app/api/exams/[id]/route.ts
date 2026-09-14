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
  return supabase;
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { error } = await supabase.from("exams").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
