"use client";

import { useEffect, useState } from "react";
import type { Resource } from "@/lib/types";

// -------- أيقونات --------
function FileIcon({ type }: { type: string }) {
  if (type.includes("pdf")) return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
      <polyline points="11 9 9 9 9 11"/>
    </svg>
  );
  if (type.startsWith("image/")) return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
  if (type.includes("word") || type.includes("document")) return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  );
  if (type.includes("video")) return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  );
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((data) => {
        setResources(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="h1 text-theme-primary">المكتبة</h1>
        <p className="text-caption text-theme-secondary mt-1">الملفات والكتب المتاحة لك</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-[#271F1A]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-[#EFF6FF] dark:bg-[#271F1A]" />
                <div className="h-3 w-24 rounded bg-[#EFF6FF] dark:bg-[#271F1A]" />
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-14 space-y-2">
          <p className="text-4xl">📚</p>
          <p className="font-extrabold text-theme-primary">المكتبة فارغة</p>
          <p className="text-caption text-theme-secondary">مفيش ملفات متاحة ليك دلوقتي</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div
              key={r.id}
              className="card flex items-start gap-4 transition-all duration-300 hover:shadow-md active:scale-[0.99]"
            >
              {/* أيقون */}
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#F8FAFC] dark:bg-[#1D1713] flex items-center justify-center border border-[#E2E8F0] dark:border-[#332922]">
                <FileIcon type={r.file_type} />
              </div>

              {/* المعلومات */}
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-theme-primary leading-snug">{r.title}</p>
                {r.description && (
                  <p className="text-caption text-theme-secondary mt-0.5 line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-caption text-theme-secondary truncate max-w-[160px]">
                    {r.file_name}
                  </span>
                  {r.file_size && (
                    <span className="text-caption text-theme-secondary shrink-0">
                      · {formatSize(r.file_size)}
                    </span>
                  )}
                </div>
              </div>

              {/* زرار التنزيل */}
              <a
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={r.file_name}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-caption font-bold text-white hover:bg-[#1D4ED8] active:scale-95 transition-all duration-200 dark:bg-[#C87A4B] dark:hover:bg-[#B5693A]"
              >
                <DownloadIcon />
                <span className="hidden sm:inline">تنزيل</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
