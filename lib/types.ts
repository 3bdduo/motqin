export type Role = "admin" | "student";

export type Profile = {
  id: string;                        
  role: Role;
  full_name: string;
  phone: string | null;
  created_at: string;
};

export type StudentSettings = {
  student_id: string;
  study_hours_per_day: number | null;
  subjects: string[];
  lesson_schedule: string | null;
  notes: string | null;
  updated_at: string;
};

export type TaskStatus = "pending" | "completed" | "late";

export type Task = {
  id: string;
  student_id: string;
  subject: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  due_date: string;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
};

export type Quote = {
  id: string;
  text: string;
  is_active: boolean;
  created_at: string;
};

export type Exam = {
  id: string;
  title: string;
  subject: string;
  exam_date: string;
  duration_minutes: number;
  created_by: string | null;
  created_at: string;
};

export type ExamQuestion = {
  id: string;
  exam_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  order_index: number;
};

export type ExamResult = {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  total: number;
  percentage: number;
  answers: number[];
  taken_at: string;
};

export type Notification = {
  id: string;
  student_id: string | null;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};
