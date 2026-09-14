"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/tasks", label: "التاسكات" },
  { href: "/admin/exams", label: "الامتحانات الشهرية" },
  { href: "/admin/quotes", label: "العبارات التحفيزية" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold transition",
              active
                ? "bg-brand-600 text-white"
                : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
