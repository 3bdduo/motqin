"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/student", label: "اليوم", icon: HomeIcon },
  { href: "/student/overdue", label: "متأخرة", icon: ClockIcon },
  { href: "/student/exams", label: "الامتحانات", icon: PencilIcon },
  { href: "/student/resources", label: "المكتبة", icon: BookIcon },
  { href: "/student/reports", label: "تقريري", icon: ChartIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  useEffect(() => {
    setLoadingHref(null);
  }, [pathname]);

  function handleNav(href: string) {
    const active = href === "/student" ? pathname === href : pathname.startsWith(href);
    if (active || loadingHref) return;
    setLoadingHref(href);
    router.push(href);
    setTimeout(() => setLoadingHref(null), 2500);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-lg shadow-lg dark:border-[#332922] dark:bg-[#14100D]/95 transition-colors duration-700">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/student" ? pathname === href : pathname.startsWith(href);
          const isLoading = loadingHref === href;
          return (
            <button
              key={href}
              type="button"
              onClick={() => handleNav(href)}
              disabled={!!loadingHref && !active}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-1 py-1.5 px-1 text-[11px] font-extrabold rounded-2xl transition-all duration-700",
                active
                  ? "text-[#2563EB] dark:text-[#E09F6E]"
                  : "text-[#475569] hover:text-[#0F172A] dark:text-[#A3968B] dark:hover:text-[#F5F0EB] hover:scale-105",
                isLoading && "opacity-70"
              )}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-[#EFF6FF] dark:bg-[#271F1A] animate-fade-in" />
              )}

              <div
                className={cn(
                  "relative flex items-center justify-center transition-transform duration-700",
                  active ? "scale-110 -translate-y-0.5" : "group-hover:scale-110"
                )}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin text-[#2563EB] dark:text-[#C87A4B]"
                    style={{ width: "22px", height: "22px" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Icon active={active} />
                )}
              </div>
              <span className="leading-tight">{isLoading ? "..." : label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function PencilIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4" width="15" height="16" rx="2" />
      <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V10M12 19V5M19 19v-7" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
