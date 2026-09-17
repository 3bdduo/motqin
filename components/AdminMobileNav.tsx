"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/tasks", label: "التاسكات" },
  { href: "/admin/exams", label: "الامتحانات" },
  { href: "/admin/quotes", label: "العبارات" },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  useEffect(() => {
    setLoadingHref(null);
  }, [pathname]);

  function handleNav(href: string) {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    if (active || loadingHref) return;
    setLoadingHref(href);
    router.push(href);
    setTimeout(() => setLoadingHref(null), 1200);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
      {items.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        const isLoading = loadingHref === href;
        return (
          <button
            key={href}
            type="button"
            onClick={() => handleNav(href)}
            disabled={!!loadingHref && !active}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-300 cursor-pointer select-none active:scale-95",
              active
                ? "bg-[#2563EB] text-white dark:bg-[#C87A4B] dark:text-white shadow-sm"
                : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] dark:bg-[#1D1713] dark:text-[#A3968B] dark:border-[#332922]"
            )}
          >
            <span>{label}</span>
            {isLoading && (
              <svg
                className="animate-spin h-3.5 w-3.5 shrink-0 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
