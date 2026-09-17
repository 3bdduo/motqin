"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Profile } from "@/lib/types";

// -------- أيقونات --------
function FileIcon({ type }: { type: string }) {
  if (type.includes("pdf")) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><polyline points="11 9 9 9 9 11"/>
    </svg>
  );
  if (type.startsWith("image/")) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
  if (type.includes("word") || type.includes("document")) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  );
  if (type.includes("video")) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminResourcesPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [students, setStudents] = useState<Pick<Profile, "id" | "full_name">[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // حالة الفورم
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"all" | "specific_students">("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    load();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/resources");
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function loadStudents() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "student")
      .order("full_name");
    setStudents((data as Pick<Profile, "id" | "full_name">[]) ?? []);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !title.trim()) return;

    setUploading(true);
    setMessage(null);

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("visibility", visibility);
    fd.append("allowed_student_ids", JSON.stringify(visibility === "specific_students" ? selectedStudentIds : []));

    const res = await fetch("/api/resources", { method: "POST", body: fd });
    const data = await res.json();

    setUploading(false);

    if (res.ok) {
      setMessage({ text: "تم رفع الملف بنجاح ✓", ok: true });
      setResources((prev) => [data, ...prev]);
      setTitle(""); setDescription(""); setVisibility("all");
      setSelectedStudentIds([]); setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setMessage({ text: data.error ?? "حدث خطأ أثناء الرفع", ok: false });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-up">
      <h1 className="h1 text-theme-primary">مكتبة الملفات</h1>

      {/* ====== فورم الرفع ====== */}
      <form
        onSubmit={handleUpload}
        className="card space-y-4"
      >
        <p className="text-body font-extrabold text-theme-primary">رفع ملف جديد</p>

        {/* Drag & Drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-[#2563EB] bg-[#EFF6FF] dark:border-[#C87A4B] dark:bg-[#271F1A]"
              : "border-[#CBD5E1] hover:border-[#2563EB] dark:border-[#4D3E35] dark:hover:border-[#C87A4B]"
          }`}
        >
          <div className="text-[#2563EB] dark:text-[#C87A4B]"><UploadIcon /></div>
          {selectedFile ? (
            <div className="text-center">
              <p className="font-bold text-[#0F172A] dark:text-[#F5F0EB]">{selectedFile.name}</p>
              <p className="text-caption text-theme-secondary">{formatSize(selectedFile.size)}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-bold text-[#475569] dark:text-[#A3968B]">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-caption text-theme-secondary mt-1">PDF، صور، Word، فيديو، وغيرها</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* العنوان */}
        <div>
          <label className="label">عنوان الملف</label>
          <input
            className="input"
            placeholder="مثال: كتاب الكيمياء للثانوية العامة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="label">وصف (اختياري)</label>
          <textarea
            className="input min-h-16"
            placeholder="وصف مختصر للملف..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* الرؤية */}
        <div>
          <label className="label">من يشوف الملف؟</label>
          <div className="flex gap-3">
            {[
              { val: "all", label: "كل الطلاب" },
              { val: "specific_students", label: "طلاب محددين" },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setVisibility(val as "all" | "specific_students")}
                className={`rounded-full border px-4 py-1.5 text-caption font-bold transition-all duration-200 ${
                  visibility === val
                    ? "border-[#2563EB] bg-[#2563EB] text-white dark:border-[#C87A4B] dark:bg-[#C87A4B]"
                    : "border-[#CBD5E1] text-[#475569] hover:border-[#2563EB] dark:border-[#4D3E35] dark:text-[#A3968B] dark:hover:border-[#C87A4B]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* اختيار الطلاب */}
        {visibility === "specific_students" && (
          <div className="animate-fade-up">
            <label className="label">اختر الطلاب</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStudent(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-caption font-bold transition-all duration-200 ${
                    selectedStudentIds.includes(s.id)
                      ? "border-[#2563EB] bg-[#2563EB] text-white dark:border-[#C87A4B] dark:bg-[#C87A4B]"
                      : "border-[#CBD5E1] text-[#475569] hover:border-[#2563EB] dark:border-[#4D3E35] dark:text-[#A3968B] dark:hover:border-[#C87A4B]"
                  }`}
                >
                  {s.full_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p className={`text-body font-bold ${message.ok ? "text-[#2563EB] dark:text-[#E09F6E]" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading || !selectedFile || !title.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              جاري الرفع...
            </span>
          ) : "رفع الملف"}
        </button>
      </form>

      {/* ====== قائمة الملفات ====== */}
      <div className="space-y-3">
        <p className="text-body font-extrabold text-theme-primary">
          الملفات المرفوعة
          {!loading && <span className="text-theme-secondary font-normal"> ({resources.length})</span>}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#271F1A]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-[#EFF6FF] dark:bg-[#271F1A]" />
                  <div className="h-3 w-24 rounded bg-[#EFF6FF] dark:bg-[#271F1A]" />
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="card text-center py-10 text-theme-secondary">
            <p className="text-2xl mb-2">📂</p>
            <p className="font-bold">لا توجد ملفات مرفوعة بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((r) => (
              <div
                key={r.id}
                className="card flex items-start gap-4 transition-all duration-300 hover:shadow-md"
              >
                {/* أيقون الملف */}
                <div className="mt-0.5 shrink-0 w-12 h-12 rounded-xl bg-[#F8FAFC] dark:bg-[#1D1713] flex items-center justify-center border border-[#E2E8F0] dark:border-[#332922]">
                  <FileIcon type={r.file_type} />
                </div>

                {/* المعلومات */}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-theme-primary truncate">{r.title}</p>
                  {r.description && (
                    <p className="text-caption text-theme-secondary mt-0.5 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-caption text-theme-secondary">{r.file_name}</span>
                    {r.file_size && (
                      <span className="text-caption text-theme-secondary">{formatSize(r.file_size)}</span>
                    )}
                    <span className={`text-caption font-bold px-2 py-0.5 rounded-full ${
                      r.visibility === "all"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {r.visibility === "all" ? "للكل" : `${r.allowed_student_ids.length} طلاب`}
                    </span>
                  </div>
                </div>

                {/* أزرار */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={r.file_name}
                    className="rounded-xl border border-[#2563EB] px-3 py-1.5 text-caption font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all duration-200 dark:border-[#C87A4B] dark:text-[#E09F6E] dark:hover:bg-[#C87A4B] dark:hover:text-white"
                  >
                    تنزيل
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.title)}
                    disabled={deletingId === r.id}
                    className="rounded-xl border border-red-300 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-40"
                  >
                    {deletingId === r.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : <TrashIcon />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
