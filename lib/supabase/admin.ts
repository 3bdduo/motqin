import { createClient } from "@supabase/supabase-js";

// تحذير: هذا الملف يستخدم service_role key وله صلاحيات كاملة على قاعدة البيانات.
// لا تستورده أبدًا داخل أي ملف يعمل في المتصفح ("use client").
// يُستخدم فقط داخل app/api/**/route.ts

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
