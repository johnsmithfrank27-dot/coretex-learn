import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flag, HelpCircle, Play, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  Toolbar,
  SearchInput,
  FilterChips,
  PrimaryButton,
  GhostButton,
  Modal,
  TextField,
  SelectField,
  LoadingBlock,
  ErrorBlock,
  ProgressBar,
} from "@/components/feature-kit";
import {
  listQuizzes,
  getQuiz,
  deleteQuiz,
  generateQuiz,
  submitAttempt,
  listAttempts,
  type Quiz,
  type Question,
} from "@/lib/quizzes.functions";

export const Route = createFileRoute("/app/quizzes")({
  head: () => ({
    meta: [
      { title: "Quizzes — Coretex" },
      { name: "description", content: "Generate, take and review AI quizzes with instant explanations and analytics." },
      { property: "og:title", content: "Quizzes — Coretex" },
      { property: "og:description", content: "Generate, take and review AI quizzes with instant explanations and analytics." },
    ],
  }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchQuizzes = useServerFn(listQuizzes);
  const fetchAttempts = useServerFn(listAttempts);
  const gen = useServerFn(generateQuiz);
  const del = useServerFn(deleteQuiz);

  const quizzesQuery = useQuery({ queryKey: ["quizzes"], queryFn: () => fetchQuizzes() });
  const attemptsQuery = useQuery({ queryKey: ["quiz-attempts"], queryFn: () => fetchAttempts() });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [genOpen, setGenOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("General");
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState("practice");
  const [playing, setPlaying] = useState<Quiz | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["quizzes"] });
    qc.invalidateQueries({ queryKey: ["quiz-attempts"] });
  };

  const genMut = useMutation({
    mutationFn: () =>
      gen({
        data: {
          topic: topic.trim(),
          subject: subject.trim() || "General",
          difficulty: difficulty as "easy" | "medium" | "hard",
          mode: mode as "practice" | "exam" | "timed" | "challenge",
          count: 8,
        },
      }),
    onSuccess: () => {
      setGenOpen(false);
      setTopic("");
      invalidate();
      toast.success("Quiz ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Quiz deleted");
    },
  });

  const quizzes: Quiz[] = quizzesQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const visible = quizzes.filter((z) => {
    if (filter !== "all" && z.mode !== filter) return false;
    const n = q.toLowerCase().trim();
    return !n || z.title.toLowerCase().includes(n) || z.subject.toLowerCase().includes(n);
  });

  const avg = attempts.length
    ? Math.round((attempts.reduce((s, a) => s + (a.total ? a.score / a.total : 0), 0) / attempts.length) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Quizzes" subtitle="Test what you know — with instant AI explanations.">
        <PrimaryButton onClick={() => setGenOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate quiz
        </PrimaryButton>
      </PageHeader>

      {attempts.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Quizzes taken" value={String(attempts.length)} />
          <Stat label="Average score" value={`${avg}%`} />
          <Stat label="Best score" value={`${Math.max(...attempts.map((a) => (a.total ? Math.round((a.score / a.total) * 100) : 0)))}%`} />
        </div>
      )}

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search quizzes…" />
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "practice", label: "Practice" },
            { value: "exam", label: "Exam" },
            { value: "timed", label: "Timed" },
            { value: "challenge", label: "Challenge" },
          ]}
        />
      </Toolbar>

      {quizzesQuery.isLoading ? (
        <LoadingBlock label="Loading your quizzes…" />
      ) : quizzesQuery.isError ? (
        <ErrorBlock message="We couldn't load your quizzes." onRetry={() => quizzesQuery.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={quizzes.length === 0 ? "No quizzes yet" : "Nothing matches that"}
          description={quizzes.length === 0 ? "Generate a quiz on any topic in seconds." : "Try another search or mode."}
          actionLabel={quizzes.length === 0 ? "Generate a quiz" : undefined}
          onAction={quizzes.length === 0 ? () => setGenOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((z) => {
            const last = attempts.find((a) => a.quiz_id === z.id);
            return (
              <article key={z.id} className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                <span className="w-fit rounded-full bg-gradient-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{z.mode}</span>
                <h3 className="mt-2 font-bold">{z.title}</h3>
                <p className="text-xs text-muted-foreground">{z.subject} · {z.question_count} questions · {z.difficulty}</p>
                {last && (
                  <p className="mt-3 text-xs font-semibold text-primary">Last score: {last.score}/{last.total}</p>
                )}
                <div className="mt-auto flex gap-1.5 border-t border-border pt-4">
                  <GhostButton title="Start quiz" onClick={() => setPlaying(z)}>
                    <Play className="h-3.5 w-3.5" /> Start
                  </GhostButton>
                  <GhostButton title="Delete quiz" onClick={() => confirm(`Delete "${z.title}"?`) && delMut.mutate(z.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </GhostButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate a quiz">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!topic.trim()) return toast.error("What topic should the quiz cover?");
            genMut.mutate();
          }}
        >
          <TextField label="Topic" value={topic} onChange={setTopic} placeholder="e.g. Cell division" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Subject" value={subject} onChange={setSubject} placeholder="Biology" />
            <SelectField
              label="Difficulty"
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
          </div>
          <SelectField
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "practice", label: "Practice" },
              { value: "exam", label: "Exam" },
              { value: "timed", label: "Timed" },
              { value: "challenge", label: "Challenge" },
            ]}
          />
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setGenOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" loading={genMut.isPending}>Generate</PrimaryButton>
          </div>
        </form>
      </Modal>

      {playing && <QuizRunner quiz={playing} onClose={() => { setPlaying(null); invalidate(); }} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function QuizRunner({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const load = useServerFn(getQuiz);
  const submit = useServerFn(submitAttempt);
  const started = useState(() => Date.now())[0];
  const detail = useQuery({ queryKey: ["quiz", quiz.id], queryFn: () => load({ data: { id: quiz.id } }) });
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; xp: number } | null>(null);

  const submitMut = useMutation({
    mutationFn: () =>
      submit({
        data: {
          quizId: quiz.id,
          answers,
          flagged,
          secondsSpent: Math.round((Date.now() - started) / 1000),
        },
      }),
    onSuccess: (r) => {
      setResult({ score: r.attempt.score, total: r.attempt.total, xp: r.xpEarned });
      toast.success(`+${r.xpEarned} XP earned`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const questions: Question[] = detail.data?.questions ?? [];
  const question = questions[idx];

  return (
    <Modal open onClose={onClose} title={quiz.title} wide>
      {detail.isLoading ? (
        <LoadingBlock label="Loading questions…" />
      ) : questions.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">This quiz has no questions.</p>
      ) : result ? (
        <div className="py-6">
          <h3 className="text-center text-2xl font-extrabold">{result.score} / {result.total}</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">+{result.xp} XP added to your profile</p>
          <div className="mt-6 space-y-3">
            {questions.map((qq, i) => {
              const chosen = answers[qq.id];
              const ok = chosen === qq.correct_answer;
              return (
                <div key={qq.id} className={`rounded-2xl border p-4 ${ok ? "border-primary/40 bg-gradient-soft" : "border-destructive/40 bg-destructive/5"}`}>
                  <p className="text-sm font-semibold">{i + 1}. {qq.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your answer: {chosen ?? "skipped"}</p>
                  {!ok && <p className="text-xs font-semibold">Correct: {qq.correct_answer}</p>}
                  {qq.explanation && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{qq.explanation}</p>}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <GhostButton onClick={() => { setResult(null); setIdx(0); setAnswers({}); }}>Retry quiz</GhostButton>
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
          </div>
        </div>
      ) : question ? (
        <div>
          <ProgressBar value={((idx + 1) / questions.length) * 100} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Question {idx + 1} of {questions.length}</p>
            <GhostButton
              title="Flag question"
              onClick={() => setFlagged((f) => (f.includes(question.id) ? f.filter((x) => x !== question.id) : [...f, question.id]))}
            >
              <Flag className={`h-3.5 w-3.5 ${flagged.includes(question.id) ? "text-primary" : ""}`} /> Flag
            </GhostButton>
          </div>
          <h3 className="mt-3 text-lg font-bold">{question.prompt}</h3>
          <div className="mt-4 space-y-2">
            {(question.options ?? []).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                className={`w-full rounded-2xl border p-4 text-left text-sm font-medium transition ${
                  answers[question.id] === opt ? "border-primary bg-gradient-soft" : "border-border hover:bg-secondary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between gap-2">
            <GhostButton disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>Previous</GhostButton>
            {idx < questions.length - 1 ? (
              <PrimaryButton onClick={() => setIdx((i) => i + 1)}>Next</PrimaryButton>
            ) : (
              <PrimaryButton loading={submitMut.isPending} onClick={() => submitMut.mutate()}>Submit quiz</PrimaryButton>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
