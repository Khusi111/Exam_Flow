import z from "zod";

// Exam schema
export const ExamSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['preparing', 'prepared']),
  start_date: z.string(),
  end_date: z.string(),
  duration_minutes: z.number(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateExamSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  start_date: z.string(),
  end_date: z.string(),
  duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
  subjects: z.array(z.object({
    name: z.string().min(1, "Subject name is required"),
    start_question: z.number().min(1, "Start question must be at least 1"),
    end_question: z.number().min(1, "End question must be at least 1"),
  })),
});

// Subject schema
export const ExamSubjectSchema = z.object({
  id: z.number(),
  exam_id: z.number(),
  name: z.string(),
  start_question: z.number(),
  end_question: z.number(),
  topics_syllabus: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  start_question: z.number().min(1, "Start question must be at least 1"),
  end_question: z.number().min(1, "End question must be at least 1"),
  topics_syllabus: z.string().optional(),
});

// Section schema
export const ExamSectionSchema = z.object({
  id: z.number(),
  exam_id: z.number(),
  subject_id: z.number(),
  name: z.string(),
  question_start: z.number(),
  question_end: z.number(),
  min_questions_to_attempt: z.number(),
  question_type: z.enum(['Single Correct MCQ', 'Numerical', 'Subjective']),
  marking_if_attempted: z.number(),
  marking_if_correct: z.number(),
  marking_if_incorrect: z.number(),
  marking_in_any_other_case: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  question_start: z.number().min(1, "Start question must be at least 1"),
  question_end: z.number().min(1, "End question must be at least 1"),
  min_questions_to_attempt: z.number().min(0, "Minimum questions cannot be negative"),
  question_type: z.enum(['Single Correct MCQ', 'Numerical', 'Subjective']),
  marking_if_attempted: z.number(),
  marking_if_correct: z.number(),
  marking_if_incorrect: z.number(),
  marking_in_any_other_case: z.number(),
});

// Question schema
export const QuestionSchema = z.object({
  id: z.number(),
  exam_id: z.number(),
  subject: z.string(),
  question_number: z.number(),
  section_name: z.string(),
  question_type: z.enum(['Single Correct MCQ', 'Numerical', 'Subjective']),
  text: z.string(),
  options: z.string().nullable(),
  correct_option: z.string().nullable(),
  solution: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateQuestionSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  question_number: z.number().min(1, "Question number must be at least 1"),
  section_name: z.string().min(1, "Section name is required"),
  question_type: z.enum(['Single Correct MCQ', 'Numerical', 'Subjective']),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).optional(),
  correct_option: z.string().optional(),
  solution: z.string().optional(),
});

export const UpdateQuestionSchema = CreateQuestionSchema.partial();

// Type exports
export type Exam = z.infer<typeof ExamSchema>;
export type CreateExam = z.infer<typeof CreateExamSchema>;
export type ExamSubject = z.infer<typeof ExamSubjectSchema>;
export type CreateSubject = z.infer<typeof CreateSubjectSchema>;
export type ExamSection = z.infer<typeof ExamSectionSchema>;
export type CreateSection = z.infer<typeof CreateSectionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
