"use client";

import Image from "next/image";

interface LogoSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: {
    container: "h-14 w-14",
    logo: 32,
    border: "border-[2.5px]",
    textSize: "text-xs",
  },
  md: {
    container: "h-20 w-20",
    logo: 48,
    border: "border-[3px]",
    textSize: "text-sm",
  },
  lg: {
    container: "h-28 w-28",
    logo: 68,
    border: "border-[3.5px]",
    textSize: "text-base",
  },
  xl: {
    container: "h-36 w-36",
    logo: 88,
    border: "border-4",
    textSize: "text-lg",
  },
};

export function LogoSpinner({
  size = "md",
  text,
  fullscreen = false,
  className = "",
}: LogoSpinnerProps) {
  const currentSize = sizeMap[size];

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Glowing Ambient Aura */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-[#2563EB]/30 via-[#C87A4B]/30 to-[#2563EB]/25 blur-lg animate-pulse-glow" />

        {/* Outer Radiant Dual-Color Spinning Ring (Blue + Leather) — fast and moving */}
        <div
          className={`absolute inset-0 rounded-full border-transparent border-t-[#2563EB] border-r-[#C87A4B] border-b-transparent border-l-[#2563EB] animate-logo-spin ${currentSize.border}`}
          style={{
            filter: "drop-shadow(0 0 10px rgba(37, 99, 235, 0.5))",
          }}
        />

        {/* Inner Counter-Rotating Leather Ring — fast and moving */}
        <div
          className={`absolute inset-1.5 rounded-full border-transparent border-b-[#C87A4B] border-l-[#C87A4B] border-t-transparent border-r-transparent animate-logo-spin-reverse opacity-85 ${currentSize.border}`}
        />

        {/* Central Logo Container with Gentle Breathing Pulse */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-md dark:bg-[#1D1713] border border-[#E2E8F0] dark:border-[#332922] animate-logo-breathe">
          <Image
            src="/logo-square.png"
            alt="شعار مُتقِن"
            width={currentSize.logo}
            height={currentSize.logo}
            className="rounded-full object-cover"
            priority
          />
        </div>
      </div>

      {/* Optional Motivational / Loading Text */}
      {text && (
        <p
          className={`font-black tracking-wide text-[#0F172A] dark:text-[#F5F0EB] animate-pulse text-center ${currentSize.textSize}`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F8FC]/80 backdrop-blur-md dark:bg-[#0A0807]/85 transition-all duration-300">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white/95 p-8 shadow-2xl dark:border-[#332922] dark:bg-[#1D1713]/95 text-center min-w-[220px] mx-4 animate-fade-in">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
}
