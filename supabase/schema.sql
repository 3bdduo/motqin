-- =========================================================
-- Motqin (مُتقِن) - Supabase schema
-- شغّل هذا الملف كامل مرة واحدة من SQL Editor في Supabase
-- =========================================================

-- ---------- الجداول ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'student')),
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_settings (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  study_hours_per_day numeric,
  subjects text[] not null default '{}',
  lesson_schedule text,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  title text not null,
  description text,
  duration_minutes int,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'late')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  exam_date timestamptz not null,
  duration_minutes int not null default 30,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_option_index int not null,
  order_index int not null default 0
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score int not null,
  total int not null,
  percentage numeric not null,
  answers jsonb not null default '[]',
  taken_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles (id) on delete cascade,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- دالة مساعدة: هل المستخدم الحالي أدمن؟ ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- تفعيل RLS ----------
alter table public.profiles enable row level security;
alter table public.student_settings enable row level security;
alter table public.tasks enable row level security;
alter table public.quotes enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_results enable row level security;
alter table public.notifications enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- يسمح لأي مستخدم بإدخال صف نفسه (يُستخدم عند إنشاء أول حساب أدمن يدويًا فقط)
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (id = auth.uid());

-- ---------- student_settings ----------
drop policy if exists "settings_select" on public.student_settings;
create policy "settings_select" on public.student_settings
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "settings_admin_write" on public.student_settings;
create policy "settings_admin_write" on public.student_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- tasks ----------
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "tasks_admin_write" on public.tasks;
create policy "tasks_admin_write" on public.tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- الطالب يقدر يعلّم مهمته فقط بأنها منجزة
drop policy if exists "tasks_student_update_status" on public.tasks;
create policy "tasks_student_update_status" on public.tasks
  for update using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ---------- quotes ----------
drop policy if exists "quotes_select" on public.quotes;
create policy "quotes_select" on public.quotes
  for select using (is_active = true or public.is_admin());

drop policy if exists "quotes_admin_write" on public.quotes;
create policy "quotes_admin_write" on public.quotes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- exams ----------
drop policy if exists "exams_select" on public.exams;
create policy "exams_select" on public.exams
  for select using (auth.uid() is not null);

drop policy if exists "exams_admin_write" on public.exams;
create policy "exams_admin_write" on public.exams
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- exam_questions ----------
drop policy if exists "exam_questions_select" on public.exam_questions;
create policy "exam_questions_select" on public.exam_questions
  for select using (auth.uid() is not null);

drop policy if exists "exam_questions_admin_write" on public.exam_questions;
create policy "exam_questions_admin_write" on public.exam_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- exam_results ----------
drop policy if exists "exam_results_select" on public.exam_results;
create policy "exam_results_select" on public.exam_results
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "exam_results_student_insert" on public.exam_results;
create policy "exam_results_student_insert" on public.exam_results
  for insert with check (student_id = auth.uid());

drop policy if exists "exam_results_admin_write" on public.exam_results;
create policy "exam_results_admin_write" on public.exam_results
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- notifications ----------
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_student_update" on public.notifications;
create policy "notifications_student_update" on public.notifications
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "notifications_admin_write" on public.notifications;
create policy "notifications_admin_write" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- إنشاء أول حساب أدمن:
-- 1) اذهب إلى Authentication -> Users -> Add User في Supabase
--    وأنشئ مستخدم بالإيميل وكلمة السر اللي تحبها.
-- 2) انسخ الـ UID بتاعه وشغّل السطر التالي بعد ما تستبدل القيم:
--
-- insert into public.profiles (id, role, full_name)
-- values ('ضع-uid-الأدمن-هنا', 'admin', 'اسم الأدمن');
-- =========================================================
