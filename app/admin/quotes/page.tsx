"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { TableRowSkeleton } from "@/components/Skeleton";
import type { Quote } from "@/lib/types";
import { appCache, prefetchAllAdminData, subscribeToCache } from "@/lib/dataCache";

export default function AdminQuotesPage() {
  const supabase = createClient();
  const [quotes, setQuotes] = useState<Quote[]>(() => appCache.admin.quotes ?? []);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(() => !appCache.admin.quotes);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (appCache.admin.quotes) {
      setQuotes(appCache.admin.quotes);
      setLoading(false);
    }

    const unsubscribe = subscribeToCache(() => {
      if (appCache.admin.quotes) {
        setQuotes(appCache.admin.quotes);
        setLoading(false);
      }
    });

    prefetchAllAdminData(supabase);

    return unsubscribe;
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    setSaving(false);
    prefetchAllAdminData(supabase, true);
  }

  async function toggleActive(quote: Quote) {
    if (togglingId === quote.id) return;
    setTogglingId(quote.id);
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, is_active: !q.is_active } : q)));
    await fetch(`/api/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !quote.is_active }),
    });
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه العبارة؟")) return;
    setDeletingId(id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setDeletingId(null);
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up">
      <div>
        <h1 className="h1 text-theme-primary">العبارات التحفيزية</h1>
        <p className="text-caption text-theme-secondary mt-1">تظهر للطالب عشوائيًا عند دخوله المنصة</p>
      </div>

      <form onSubmit={handleAdd} className="card flex gap-2">
        <input
          className="input"
          placeholder="اكتب عبارة تحفيزية جديدة..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={saving}
          loadingText="..."
          disabled={saving || !text.trim()}
          className="shrink-0"
        >
          إضافة
        </Button>
      </form>

      {loading && <TableRowSkeleton count={4} />}

      {!loading && (
        <div className="space-y-2">
          {quotes.map((quote) => (
            <div key={quote.id} className="card flex items-center justify-between gap-3">
              <p className={`text-body font-bold ${quote.is_active ? "text-theme-primary" : "text-theme-secondary line-through"}`}>
                {quote.text}
              </p>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={togglingId === quote.id}
                  loadingText="..."
                  onClick={() => toggleActive(quote)}
                >
                  {quote.is_active ? "إخفاء" : "تفعيل"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === quote.id}
                  loadingText="..."
                  onClick={() => handleDelete(quote.id)}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
