import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // نجيب الـ role من الـ user metadata لو موجودة (أسرع)
  // ولو مش موجودة نجيب من قاعدة البيانات
  const role = session.user.user_metadata?.role as string | undefined;

  if (role === "admin" || role === "student") {
    redirect(role === "admin" ? "/admin" : "/student");
  }

  // fallback: نجيب من قاعدة البيانات
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  redirect(profile?.role === "admin" ? "/admin" : "/student");
}
