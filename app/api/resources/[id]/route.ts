import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// DELETE — حذف ملف (أدمن فقط)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const adminClient = createAdminClient();

  // جلب بيانات الملف عشان نعرف مساره في Storage
  const { data: resource, error: fetchError } = await adminClient
    .from("resources")
    .select("file_url")
    .eq("id", params.id)
    .single();

  if (fetchError || !resource) {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }

  // استخراج مسار الملف من الـ URL
  const url = new URL(resource.file_url);
  // المسار بيكون: /storage/v1/object/public/resources/filename.ext
  const pathParts = url.pathname.split("/resources/");
  const storagePath = pathParts[1] ?? "";

  // حذف من Storage
  if (storagePath) {
    await adminClient.storage.from("resources").remove([storagePath]);
  }

  // حذف من قاعدة البيانات
  const { error: deleteError } = await adminClient
    .from("resources")
    .delete()
    .eq("id", params.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
