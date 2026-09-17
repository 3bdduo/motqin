import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminMobileNav } from "@/components/AdminMobileNav";
import { LogoWithModal } from "@/components/LogoWithModal";
import { AdminDataPrefetcher } from "@/components/DataPrefetcher";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#0A0807] transition-colors duration-300">
      <AdminDataPrefetcher />
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-sm dark:border-[#332922] dark:bg-[#14100D]/95 transition-all duration-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <LogoWithModal />
            <div>
              <p className="text-xs font-bold text-[#475569] dark:text-[#A3968B]">
                الاستاذة اسراء حسن — لوحة التحكم
              </p>
              <p className="font-extrabold text-[#0F172A] dark:text-[#F5F0EB]">
                {profile?.full_name ?? "المشرف"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle showLabels="responsive" />
            <SignOutButton />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <AdminMobileNav />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24">
            <AdminSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
