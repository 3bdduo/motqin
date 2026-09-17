import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthedUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await getAuthedUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET — جلب الملفات
export async function GET() {
  const { supabase, user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  let query = supabase.from("resources").select("*").order("created_at", { ascending: false });

  if (!isAdmin) {
    // الطالب يشوف: visibility = 'all' أو id بتاعه موجود في allowed_student_ids
    query = query.or(`visibility.eq.all,allowed_student_ids.cs.{${user.id}}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — رفع ملف جديد (أدمن فقط)
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const visibility = (formData.get("visibility") as string) ?? "all";
  const allowedIdsRaw = formData.get("allowed_student_ids") as string | null;

  if (!file || !title) {
    return NextResponse.json({ error: "الملف والعنوان مطلوبان" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // رفع الملف لـ Supabase Storage
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await adminClient.storage
    .from("resources")
    .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = adminClient.storage.from("resources").getPublicUrl(storagePath);

  let parsedIds: string[] = [];
  try { parsedIds = allowedIdsRaw ? JSON.parse(allowedIdsRaw) : []; } catch { parsedIds = []; }

  const { data: resource, error: dbError } = await adminClient.from("resources").insert({
    title,
    description: description || null,
    file_url: urlData.publicUrl,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    visibility,
    allowed_student_ids: parsedIds,
    created_by: admin.id,
  }).select().single();

  if (dbError) {
    await adminClient.storage.from("resources").remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(resource, { status: 201 });
}
