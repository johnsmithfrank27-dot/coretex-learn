import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateStructured } from "@/lib/ai-json.server";

export type Quiz = {
  id: string;
  owner_id: string;
  title: string;
  subject: string;
  mode: string;
  difficulty: string;
  question_count: number;
  time_limit: number | null;
  visibility: string;
  ai_generated: boolean;
  xp_reward: number;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_answer: string | null;
  explanation: string | null;
  question_type: string;
  created_at: string;
};

export type Attempt = {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  flagged: string[];
  seconds_spent: number;
  completed: boolean;
  created_at: string;
};

export const listQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Quiz[];
  });

export const getQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: quiz, error } = await context.supabase.from("quizzes").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const { data: qs, error: qErr } = await context.supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", data.id)
      .order("created_at", { ascending: true });
    if (qErr) throw new Error(qErr.message);
    return { quiz: quiz as Quiz, questions: (qs ?? []) as unknown as Question[] };
  });

export const deleteQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await context.supabase.from("quiz_questions").delete().eq("quiz_id", data.id);
    const { error } = await context.supabase.from("quizzes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        topic: z.string().min(1).max(200),
        subject: z.string().max(80).default("General"),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        mode: z.enum(["practice", "exam", "timed", "challenge"]).default("practice"),
        count: z.number().int().min(3).max(20).default(8),
        noteId: z.string().uuid().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    let source = "";
    if (data.noteId) {
      const { data: note } = await context.supabase
        .from("notes")
        .select("title,content")
        .eq("id", data.noteId)
        .maybeSingle();
      if (note) source = `${note.title}\n\n${note.content}`;
    }

    const gen = await generateStructured({
      schema: z.object({
        questions: z
          .array(
            z.object({
              prompt: z.string(),
              options: z.array(z.string()).min(2).max(6),
              correct_answer: z.string(),
              explanation: z.string(),
              question_type: z.enum(["multiple_choice", "true_false"]),
            }),
          )
          .min(1),
      }),
      system:
        "You write rigorous exam-quality questions. correct_answer must exactly match one of the options. Explanations teach the concept.",
      prompt: `Write ${data.count} ${data.difficulty} questions about "${data.topic}" (subject: ${data.subject}).${source ? `\n\nBase them on:\n${source.slice(0, 12000)}` : ""}`,
    });

    const { data: quiz, error } = await context.supabase
      .from("quizzes")
      .insert({
        owner_id: context.userId,
        title: data.topic,
        subject: data.subject,
        mode: data.mode,
        difficulty: data.difficulty,
        question_count: gen.questions.length,
        time_limit: data.mode === "timed" || data.mode === "exam" ? gen.questions.length * 60 : null,
        visibility: "private",
        ai_generated: true,
        xp_reward: gen.questions.length * 10,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const { error: qErr } = await context.supabase.from("quiz_questions").insert(
      gen.questions.map((q) => ({
        quiz_id: (quiz as Quiz).id,
        prompt: q.prompt,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        question_type: q.question_type,
      })),
    );
    if (qErr) throw new Error(qErr.message);
    return quiz as Quiz;
  });

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        quizId: z.string().uuid(),
        answers: z.record(z.string(), z.string()),
        flagged: z.array(z.string()).default([]),
        secondsSpent: z.number().int().min(0).default(0),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: qs, error } = await context.supabase
      .from("quiz_questions")
      .select("id,correct_answer")
      .eq("quiz_id", data.quizId);
    if (error) throw new Error(error.message);
    const questions = qs ?? [];
    const score = questions.filter((q) => data.answers[q.id] && data.answers[q.id] === q.correct_answer).length;

    const { data: attempt, error: aErr } = await context.supabase
      .from("quiz_attempts")
      .insert({
        user_id: context.userId,
        quiz_id: data.quizId,
        score,
        total: questions.length,
        answers: data.answers,
        flagged: data.flagged,
        seconds_spent: data.secondsSpent,
        completed: true,
      })
      .select("*")
      .single();
    if (aErr) throw new Error(aErr.message);

    // Award XP for correct answers so Progress and Leaderboards stay in sync.
    const xp = score * 10;
    if (xp > 0) {
      const { data: profile } = await context.supabase
        .from("profiles")
        .select("xp")
        .eq("id", context.userId)
        .maybeSingle();
      await context.supabase
        .from("profiles")
        .update({ xp: (profile?.xp ?? 0) + xp })
        .eq("id", context.userId);
    }

    return { attempt: attempt as unknown as Attempt, xpEarned: xp };
  });

export const listAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quiz_attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Attempt[];
  });