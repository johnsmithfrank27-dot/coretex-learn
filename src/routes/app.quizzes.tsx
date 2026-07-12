import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { CheckCircle2, XCircle, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/_app/quizzes")({ component: Quizzes });

function Quizzes() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Quizzes" subtitle="Test yourself. Improve fast." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Question 5 of 20</div>
          <h2 className="mt-2 text-2xl font-bold">Which organelle is responsible for producing energy in the cell?</h2>
          <div className="mt-6 space-y-3">
            {[
              { l: "Nucleus", state: "off" },
              { l: "Mitochondria", state: "correct" },
              { l: "Ribosome", state: "off" },
              { l: "Golgi apparatus", state: "wrong" },
            ].map(o => (
              <button key={o.l} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition ${
                o.state === "correct" ? "border-success/40 bg-success/10 text-success" :
                o.state === "wrong" ? "border-destructive/40 bg-destructive/10 text-destructive" :
                "border-border bg-secondary/40 hover:bg-accent"
              }`}>
                {o.l}
                {o.state === "correct" && <CheckCircle2 className="h-5 w-5" />}
                {o.state === "wrong" && <XCircle className="h-5 w-5" />}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-soft p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary"><Sparkles className="h-4 w-4" /> AI Explanation</div>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              Mitochondria generate most of the cell's ATP through oxidative phosphorylation — earning them the nickname "powerhouse of the cell."
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
            <Trophy className="h-6 w-6" />
            <div className="mt-3 text-sm opacity-90">Your Score</div>
            <div className="text-5xl font-extrabold">85%</div>
            <div className="mt-1 text-sm opacity-90">17 / 20 correct — top 10% this week</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="font-bold mb-3">Review Mistakes</div>
            {["Question 3 · Anatomy", "Question 11 · Genetics", "Question 18 · Ecology"].map(x => (
              <div key={x} className="flex items-center gap-2 py-2 text-sm border-b last:border-0 border-border/60">
                <XCircle className="h-4 w-4 text-destructive" /> {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}