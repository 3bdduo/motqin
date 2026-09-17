import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { SignOutButton } from "@/components/SignOutButton";
import { BottomNav } from "@/components/BottomNav";
import { LogoWithModal } from "@/components/LogoWithModal";
import { StudentDataPrefetcher } from "@/components/DataPrefetcher";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  const studentName = profile?.full_name ?? "الطالب";

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#0A0807] pb-28 transition-colors duration-300">
      <StudentDataPrefetcher userId={user?.id} />
      {/* Header outer-div: Light #FFFFFF, Dark #14100D; border: Light #E2E8F0, Dark #332922 */}
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-sm dark:border-[#332922] dark:bg-[#14100D]/95 transition-all duration-700">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Clickable Logo — opens modal on click */}
            <LogoWithModal />

            <div>
              <p className="text-caption font-bold text-theme-secondary tracking-wide">
                مُتقِن — الاستاذة اسراء حسن
              </p>
              <p className="font-black text-body text-theme-primary truncate max-w-[160px]">
                {studentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle showLabels="responsive" />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
