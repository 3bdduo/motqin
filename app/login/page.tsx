"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";
import { LogoSpinner } from "@/components/LogoSpinner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.replace(profile?.role === "admin" ? "/admin" : "/student");
    router.refresh();
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col lg:flex-row bg-[#F4F8FC] dark:bg-[#0A0807] transition-colors duration-[1000ms] ease-in-out relative"
    >
      {/* Centered Moving Loading Spinner in Middle of Screen */}
      {loading && <LogoSpinner fullscreen={true} size="lg" text="جاري تسجيل الدخول..." />}
      {/* ═══════════════════════════════════════════
          THEME TOGGLE
          Fixed at top-left corner with high z-index,
          completely separated from the login form
      ════════════════════════════════════════════ */}
      <div className="fixed top-4 left-4 md:top-5 md:left-6 z-40">
        <ThemeToggle />
      </div>

      {/* ═══════════════════════════════════════════
          HERO PANEL — Branded Hero Section
          On mobile: Displays first at the top with a button to jump down to the login form
          On desktop: Displays on the side (split screen)
      ════════════════════════════════════════════ */}
      <div className="flex flex-col items-center justify-center relative overflow-hidden w-full lg:w-1/2 xl:w-[55%] min-h-[85vh] lg:min-h-screen py-16 px-6 lg:px-12 xl:px-16 text-center">
        {/* Rich gradient background with smooth cross-fade */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] opacity-100 dark:opacity-0 transition-opacity duration-[1000ms] ease-in-out pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0807] via-[#14100D] to-[#1D1713] opacity-0 dark:opacity-100 transition-opacity duration-[1000ms] ease-in-out pointer-events-none" />

        {/* Decorative geometric elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 dark:bg-[#C87A4B]/10 blur-3xl transition-colors duration-[1000ms]" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 dark:bg-[#C87A4B]/8 blur-3xl transition-colors duration-[1000ms]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-white/5 dark:bg-[#C87A4B]/5 blur-2xl transition-colors duration-[1000ms]" />

          {/* Geometric grid overlay */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating circles */}
          <div className="absolute top-16 left-16 h-16 w-16 rounded-full border-2 border-white/20 dark:border-[#C87A4B]/20 animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 right-12 h-10 w-10 rounded-full border-2 border-white/15 dark:border-[#C87A4B]/15 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-24 left-1/3 h-8 w-8 rounded-full border border-white/20 dark:border-[#C87A4B]/20 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/3 right-20 h-20 w-20 rounded-full border border-white/10 dark:border-[#C87A4B]/10 animate-float" style={{ animationDelay: "0.5s" }} />

          {/* Hexagon accents */}
          <svg className="absolute top-1/4 -left-8 h-48 w-48 opacity-10 dark:opacity-[0.06]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="white" strokeWidth="1" />
          </svg>
          <svg className="absolute bottom-1/4 -right-8 h-64 w-64 opacity-[0.07] dark:opacity-[0.04]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="white" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 lg:px-12 xl:px-16 animate-fade-up">
          {/* Large Logo */}
          <div className="mb-6 lg:mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-white/20 dark:bg-[#C87A4B]/20 blur-xl scale-110" />
            <div className="relative flex items-center justify-center w-24 h-24 lg:w-28 lg:h-28 rounded-full border-2 border-white/40 dark:border-[#C87A4B]/40 bg-white/20 dark:bg-[#1D1713]/60 backdrop-blur-sm shadow-2xl p-1 overflow-hidden">
              <Image
                src="/logo-square.png"
                alt="شعار مُتقِن"
                width={104}
                height={104}
                className="rounded-full object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white dark:text-[#F5F0EB] tracking-wide mb-2 lg:mb-3 font-heading">
            مُتْقِن
          </h1>
          <p className="text-base lg:text-lg xl:text-xl font-bold text-white/90 dark:text-[#E09F6E] mb-1.5 font-heading">
            منصة الأستاذة إسراء حسن
          </p>
          <p className="text-sm lg:text-base font-semibold text-white/75 dark:text-[#A3968B] mb-6 lg:mb-8">
            للإتقان والتفوق الأكاديمي
          </p>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-white/30 dark:bg-[#C87A4B]/40 rounded-full mb-6 lg:mb-8" />

          {/* Tagline */}
          <p className="text-white/70 dark:text-[#A3968B] text-xs lg:text-sm font-medium leading-relaxed max-w-xs mb-8 lg:mb-10">
            خطوة بخطوة نحو القمة
          </p>

          {/* Feature Bullets */}
          <div className="space-y-3.5 text-right w-full max-w-xs">
            {[
              { text: "متابعة الواجبات والامتحانات" },
              { text: "تقارير الأداء والتقدم الأكاديمي" },
              { text: "تنبيهات فورية للمهام المتأخرة" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 animate-fade-up"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/15 dark:bg-[#C87A4B]/20">
                  <svg className="w-2.5 h-2.5 text-white dark:text-[#E09F6E]" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </span>
                <span className="text-white/80 dark:text-[#A3968B] text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile CTA Button — Takes user directly to the login form */}
          <div className="mt-8 lg:hidden animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <button
              type="button"
              onClick={() => {
                document.getElementById("login-form-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2.5 rounded-full bg-white text-[#1E40AF] dark:bg-[#C87A4B] dark:text-white font-black px-7 py-3.5 text-sm shadow-xl hover:scale-105 active:scale-95 transition-all duration-700 cursor-pointer"
            >
              <span>تسجيل الدخول إلى حسابك</span>
              <svg
                className="w-4 h-4 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LOGIN FORM PANEL
      ════════════════════════════════════════════ */}
      <div
        id="login-form-section"
        className="flex-1 flex flex-col items-center justify-center relative px-5 pt-20 pb-12 lg:py-12 lg:px-10 xl:px-16 min-h-screen"
      >
        {/* Subtle ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#2563EB]/6 dark:bg-[#C87A4B]/6 blur-3xl transition-colors duration-[1000ms]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#2563EB]/4 dark:bg-[#C87A4B]/4 blur-3xl transition-colors duration-[1000ms]" />
        </div>

        {/* Login Card */}
        <div className="relative w-full max-w-md animate-fade-up" style={{ animationDelay: "0.05s" }}>
          {/* Card glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[#2563EB]/5 dark:bg-[#C87A4B]/8 blur-2xl scale-105 opacity-70 transition-colors duration-[1000ms]" />

          {/* Card */}
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#332922] bg-white dark:bg-[#1D1713] shadow-[0_8px_40px_-8px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.7)] p-7 md:p-8 xl:p-9 transition-all duration-[1000ms] ease-in-out">

            {/* Card Header */}
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-[#F5F0EB] font-heading mb-1.5">
                تسجيل الدخول
              </h2>
              <p className="text-sm font-medium text-[#475569] dark:text-[#A3968B]">
                أدخل بياناتك للوصول إلى منصتك
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-[#0F172A] dark:text-[#F5F0EB]"
                >
                  البريد الإلكتروني
                </label>
                <div
                  className={[
                    "relative flex items-center rounded-2xl border transition-all duration-200 bg-[#F8FAFC] dark:bg-[#271F1A]",
                    emailFocused
                      ? "border-[#2563EB] dark:border-[#C87A4B] shadow-[0_0_0_3px_rgba(37,99,235,0.12)] dark:shadow-[0_0_0_3px_rgba(200,122,75,0.15)]"
                      : "border-[#E2E8F0] dark:border-[#332922]",
                  ].join(" ")}
                >
                  {/* Email Icon on the right side */}
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg
                      style={{ height: "18px", width: "18px" }}
                      className={emailFocused ? "text-[#2563EB] dark:text-[#C87A4B]" : "text-[#94A3B8] dark:text-[#4D3E35]"}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full bg-transparent py-3.5 pr-11 pl-4 text-sm font-medium text-[#0F172A] dark:text-[#F5F0EB] placeholder:text-[#94A3B8] dark:placeholder:text-[#4D3E35] focus:outline-none rounded-2xl"
                    placeholder="example@email.com"
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-[#0F172A] dark:text-[#F5F0EB]"
                  >
                    كلمة المرور
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#E09F6E] dark:hover:text-[#D98A5B] transition-colors duration-200 hover:underline underline-offset-2"
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div
                  className={[
                    "relative flex items-center rounded-2xl border transition-all duration-200 bg-[#F8FAFC] dark:bg-[#271F1A]",
                    passwordFocused
                      ? "border-[#2563EB] dark:border-[#C87A4B] shadow-[0_0_0_3px_rgba(37,99,235,0.12)] dark:shadow-[0_0_0_3px_rgba(200,122,75,0.15)]"
                      : "border-[#E2E8F0] dark:border-[#332922]",
                  ].join(" ")}
                >
                  {/* Lock Icon on the right side */}
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg
                      style={{ height: "18px", width: "18px" }}
                      className={passwordFocused ? "text-[#2563EB] dark:text-[#C87A4B]" : "text-[#94A3B8] dark:text-[#4D3E35]"}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  {/* Eye Toggle on the left side */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#4D3E35] hover:text-[#2563EB] dark:hover:text-[#C87A4B] transition-colors duration-200 focus:outline-none p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <svg style={{ height: "16px", width: "16px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg style={{ height: "16px", width: "16px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full bg-transparent py-3.5 pr-11 pl-11 text-sm font-medium text-[#0F172A] dark:text-[#F5F0EB] placeholder:text-[#94A3B8] dark:placeholder:text-[#4D3E35] focus:outline-none rounded-2xl"
                    placeholder="••••••••"
                    dir="ltr"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-coral-50 border border-coral-200 dark:bg-coral-950/40 dark:border-coral-900/50 p-3 animate-wiggle">
                  <svg className="shrink-0 text-coral-600 dark:text-coral-300" style={{ height: "16px", width: "16px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <p className="text-sm font-bold text-coral-700 dark:text-coral-300">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  loadingText="جاري تسجيل الدخول..."
                  className="w-full !rounded-2xl"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </form>

            {/* Footer Note */}
            <p className="mt-6 text-center text-xs font-medium text-[#94A3B8] dark:text-[#4D3E35]">
              حسابك يُنشئه المشرف
              <span className="mx-1.5 opacity-40">·</span>
              <span className="text-[#475569] dark:text-[#A3968B]">تواصل معه عند الحاجة</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
