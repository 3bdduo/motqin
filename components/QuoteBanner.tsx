"use client";

import { useState, useEffect } from "react";

export function QuoteBanner({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl p-5 text-white shadow-sm border transition-all duration-700",
        // Light mode: Blue gradient with #2563EB; Dark mode: Warm Leather & Deep Black with #1D1713 and #C87A4B
        "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] border-[#2563EB]/40",
        "dark:bg-gradient-to-r dark:from-[#271F1A] dark:via-[#1D1713] dark:to-[#14100D] dark:border-[#332922] dark:text-[#F5F0EB]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
    >
      {/* Decorative geometry — no emoji, pure CSS shapes */}
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-md" />
      <div className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-white/10 blur-md" />
      <div className="pointer-events-none absolute top-2 right-1/3 h-10 w-10 rounded-full bg-white/8" />

      {/* Decorative lines (no emoji) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: 2,
              height: `${20 + i * 12}px`,
              top: `${20 + i * 20}%`,
              left: `${8 + i * 24}%`,
              transform: "rotate(30deg)",
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Quote accent bar */}
      <div className="relative mb-3 flex items-center gap-2">
        <div className="h-0.5 w-6 rounded-full bg-white/60" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
          الاستاذة اسراء حسن
        </span>
        <div className="h-0.5 flex-1 rounded-full bg-white/30" />
      </div>

      <p className="relative text-sm font-bold leading-relaxed tracking-wide">{text}</p>
    </div>
  );
}
