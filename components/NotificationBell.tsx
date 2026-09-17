"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function NotificationBell() {
  const supabase = createClient();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as Notification[]) ?? []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", onClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        aria-label="الإشعارات"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-transparent text-[#0F172A] transition-all duration-700 hover:bg-[#F1F5F9] dark:border-[#4D3E35] dark:bg-transparent dark:text-[#F5F0EB] dark:hover:bg-[#271F1A]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 9a6 6 0 1 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15.5 18 9Z" />
          <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-extrabold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-40 w-80 max-w-[85vw] animate-fade-up rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-2 shadow-md dark:border-[#332922] dark:bg-[#14100D]">
          <p className="px-2 py-1.5 text-sm font-extrabold text-[#0F172A] dark:text-[#F5F0EB]">الإشعارات</p>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-[#475569] dark:text-[#A3968B]">لا توجد إشعارات حاليًا</p>
            )}
            {items.map((n) => (
              <div key={n.id} className="rounded-lg px-2 py-2 hover:bg-[#EFF6FF] dark:hover:bg-[#271F1A]">
                <p className="text-sm font-bold text-[#0F172A] dark:text-[#F5F0EB]">{n.message}</p>
                <p className="mt-0.5 text-xs text-[#475569] dark:text-[#A3968B]">{formatDateTime(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
