"use client";

import { useEffect, useState } from "react";

export function ProgressRing({ percent, size = 128 }: { percent: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, animated)) / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  const isComplete = percent === 100;

  // Theme-compliant progress ring colors (Zero violet):
  // Complete: #2563EB (Light) / #C87A4B (Dark); Mid: #2563EB; Lower: #C87A4B / #475569
  const strokeColor =
    percent === 100
      ? "#2563EB"
      : percent >= 50
      ? "#2563EB"
      : percent >= 25
      ? "#C87A4B"
      : "#475569";

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-500 ${
        isComplete ? "animate-pulse-glow" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track: Light #E2E8F0, Dark #332922 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-[#E2E8F0] dark:stroke-[#332922]"
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          stroke={strokeColor}
          style={{
            transition: "stroke-dashoffset 1200ms cubic-bezier(0.16, 1, 0.3, 1), stroke 600ms ease",
            filter: `drop-shadow(0 0 6px ${strokeColor}66)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span
          className={`font-black ${
            size < 100 ? "text-lg" : "text-2xl"
          } text-[#0F172A] dark:text-[#F5F0EB] tracking-tight`}
        >
          {Math.round(animated)}٪
        </span>
        <span className="text-[10px] font-extrabold text-[#475569] dark:text-[#A3968B]">
          {isComplete ? "مكتمل" : percent >= 50 ? "مستمر" : "البداية"}
        </span>
      </div>
    </div>
  );
}
