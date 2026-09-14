"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="mb-1 text-xl font-extrabold text-ink-900 dark:text-white">
          استعادة كلمة المرور
        </h1>
        <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">
          هنبعتلك رابط لإعادة تعيين كلمة المرور على بريدك الإلكتروني.
        </p>

        {sent ? (
          <div className="card">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-400">
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
              <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-bold text-coral-700 dark:bg-coral-900/30 dark:text-coral-300">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </form>
        )}

        <a href="/login" className="mt-4 block text-center text-sm font-bold text-brand-600 hover:underline dark:text-brand-400">
          الرجوع لتسجيل الدخول
        </a>
      </div>
    </div>
  );
}
