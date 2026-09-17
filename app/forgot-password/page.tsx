"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError("حدث خطأ، تأكد من صحة البريد الإلكتروني");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8FC] px-4 dark:bg-[#0A0807] transition-colors duration-300">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="mb-1 h1 text-theme-primary">
          استعادة كلمة المرور
        </h1>
        <p className="mb-6 text-caption text-theme-secondary">
          هنبعتلك رابط لإعادة تعيين كلمة المرور على بريدك الإلكتروني.
        </p>

        {sent ? (
          <div className="card text-center py-6 space-y-2">
            <p className="text-body font-bold text-[#2563EB] dark:text-[#E09F6E]">
              تم إرسال الرابط! افتح بريدك الإلكتروني واتبع التعليمات.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="label" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="example@email.com"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-coral-50 border border-coral-200 px-3 py-2 text-caption font-black text-coral-700 dark:bg-coral-950/40 dark:border-coral-900/50 dark:text-coral-300">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              loadingText="جاري الإرسال..."
              className="w-full"
            >
              إرسال رابط الاستعادة
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-4 block text-center text-body font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline dark:text-[#E09F6E] dark:hover:text-[#D98A5B] transition-colors duration-200"
        >
          الرجوع لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
