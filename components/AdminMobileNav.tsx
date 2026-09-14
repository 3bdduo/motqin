"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
      {items.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
              active
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-600 border border-ink-200 dark:bg-ink-900 dark:text-ink-300 dark:border-ink-700"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
