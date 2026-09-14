import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "student") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { answers } = await request.json();
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "إجابات غير صالحة" }, { status: 400 });
  }

  const { data: questions, error: qError } = await supabase
    .from("exam_questions")
    .select("id, correct_option_index, order_index")
    .eq("exam_id", params.id)
    .order("order_index", { ascending: true });

  if (qError || !questions || questions.length === 0) {
    return NextResponse.json({ error: "تعذّر إيجاد أسئلة الامتحان" }, { status: 400 });
  }

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correct_option_index) score += 1;
  });

  const total = questions.length;
  const percentage = Math.round((score / total) * 1000) / 10;

  const { data: result, error: insertError } = await supabase
    .from("exam_results")
    .upsert(
      {
        exam_id: params.id,
        student_id: user.id,
        score,
        total,
        percentage,
        answers,
        taken_at: new Date().toISOString(),
      },
      { onConflict: "exam_id,student_id" }
    )
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json(result);
}
