"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin shrink-0", className || "h-4 w-4")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1D4ED8] dark:bg-[#C87A4B] dark:text-white dark:hover:bg-[#D98A5B] border border-transparent shadow-sm",
  secondary:
    "bg-transparent border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] dark:border-[#4D3E35] dark:text-[#F5F0EB] dark:hover:bg-[#271F1A]",
  danger:
    "bg-coral-50 text-coral-700 border border-coral-200 hover:bg-coral-100 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-900/50 dark:hover:bg-coral-900/50",
  ghost:
    "bg-transparent text-[#475569] hover:bg-[#EFF6FF] hover:text-[#0F172A] dark:text-[#A3968B] dark:hover:bg-[#271F1A] dark:hover:text-[#F5F0EB] border border-transparent",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-5 py-3 text-base rounded-2xl gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      icon,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          "relative inline-flex items-center justify-center font-extrabold select-none",
          "transition-all duration-[750ms] ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:focus-visible:ring-[#C87A4B]",
          sizeStyles[size],
          variantStyles[variant],
          isDisabled
            ? "opacity-60 cursor-not-allowed pointer-events-none"
            : "active:scale-[0.98] cursor-pointer hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <ButtonSpinner className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<unknown> | void;
}

export function AsyncButton({
  onClick,
  isLoading: controlledLoading,
  disabled,
  ...props
}: AsyncButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = controlledLoading !== undefined ? controlledLoading : internalLoading;

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!onClick || loading || disabled) return;
    try {
      const result = onClick(e);
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      isLoading={loading}
      onClick={handleClick}
    />
  );
}
