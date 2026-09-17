import Image from "next/image";

export type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoWithModalProps {
  size?: LogoSize;
  className?: string;
}

// Logo sizes — clean circular emblem with perfect square crop, no click modal
const SIZES: Record<LogoSize, { dim: number; cls: string }> = {
  sm: { dim: 40, cls: "w-10 h-10" },
  md: { dim: 52, cls: "w-12 h-12" },
  lg: { dim: 72, cls: "w-16 h-16" },
  xl: { dim: 96, cls: "w-24 h-24" },
};

export function LogoWithModal({ size = "md", className = "" }: LogoWithModalProps) {
  const { dim, cls } = SIZES[size] || SIZES.md;
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden p-0.5 bg-white/20 dark:bg-[#C87A4B]/15 ring-2 ring-[#E2E8F0] dark:ring-[#C87A4B]/30 shadow-sm ${cls} ${className}`}
    >
      <Image
        src="/logo-square.png"
        alt="شعار مُتقِن"
        width={dim}
        height={dim}
        className="h-full w-full rounded-full object-cover"
        priority
      />
    </div>
  );
}
