import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return { supabase, user };
}

export async function POST(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { supabase, user } = ctx;

  const body = await request.json();
  const { title, subject, exam_date, duration_minutes, questions } = body;

  if (!title || !subject || !exam_date || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  }

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      title,
      subject,
      exam_date,
      duration_minutes: duration_minutes ?? 30,
      created_by: user.id,
    })
    .select()
    .single();

  if (examError) return NextResponse.json({ error: examError.message }, { status: 400 });

  const questionRows = questions.map((q: any, i: number) => ({
    exam_id: exam.id,
    question_text: q.question_text,
    options: q.options,
    correct_option_index: q.correct_option_index,
    order_index: i,
  }));

  const { error: questionsError } = await supabase.from("exam_questions").insert(questionRows);

  if (questionsError) {
    await supabase.from("exams").delete().eq("id", exam.id);
    return NextResponse.json({ error: questionsError.message }, { status: 400 });
  }

  const { data: students } = await supabase.from("profiles").select("id").eq("role", "student");
  if (students && students.length > 0) {
    await supabase.from("notifications").insert(
      students.map((s) => ({
        student_id: s.id,
        message: `تم إضافة امتحان شهري جديد: ${title}`,
        type: "exam",
      }))
    );
  }

  return NextResponse.json(exam);
}
