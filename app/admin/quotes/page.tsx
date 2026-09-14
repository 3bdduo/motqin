"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Quote } from "@/lib/types";

export default function AdminQuotesPage() {
  const supabase = createClient();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    setQuotes((data as Quote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    load();
  }

  async function toggleActive(quote: Quote) {
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, is_active: !q.is_active } : q)));
    await fetch(`/api/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !quote.is_active }),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه العبارة؟")) return;
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">العبارات التحفيزية ❤️</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">تظهر للطالب عشوائيًا عند دخوله المنصة</p>
      </div>

      <form onSubmit={handleAdd} className="card flex gap-2">
        <input
          className="input"
          placeholder="اكتب عبارة تحفيزية جديدة..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary shrink-0">
          إضافة
        </button>
      </form>

      {loading && <p className="text-sm text-ink-400">جاري التحميل...</p>}

      <div className="space-y-2">
        {quotes.map((quote) => (
          <div key={quote.id} className="card flex items-center justify-between gap-3">
            <p className={`text-sm font-bold ${quote.is_active ? "text-ink-900 dark:text-white" : "text-ink-400 line-through"}`}>
              {quote.text}
            </p>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => toggleActive(quote)} className="btn-secondary">
                {quote.is_active ? "إخفاء" : "تفعيل"}
              </button>
              <button onClick={() => handleDelete(quote.id)} className="btn-danger">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
