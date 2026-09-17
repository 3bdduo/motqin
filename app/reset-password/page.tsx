"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError("تعذّر تحديث كلمة المرور. الرابط ربما انتهت صلاحيته.");
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/login"), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8FC] px-4 dark:bg-[#0A0807] transition-colors duration-300">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="mb-6 h1 text-theme-primary">
          كلمة مرور جديدة
        </h1>

        {done ? (
          <div className="card text-center py-6">
            <p className="text-body font-bold text-[#2563EB] dark:text-[#E09F6E]">
              تم تحديث كلمة المرور، جاري تحويلك لتسجيل الدخول...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="label" htmlFor="password">
                كلمة المرور الجديدة
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
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
              loadingText="جاري الحفظ..."
              className="w-full"
            >
              حفظ كلمة المرور
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
