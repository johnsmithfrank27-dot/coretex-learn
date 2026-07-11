import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/flashcards")({ component: Flashcards });

const deck = [
  { q: "What is the powerhouse of the cell?", a: "Mitochondria" },
  { q: "Newton's second law formula?", a: "F = ma" },
  { q: "Chemical symbol for gold?", a: "Au" },
  { q: "Solve: x² − 4 = 0", a: "x = ±2" },
];

function Flashcards() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const card = deck[i];
  const next = () => { setFlip(false); setI((i + 1) % deck.length); };
  const prev = () => { setFlip(false); setI((i - 1 + deck.length) % deck.length); };
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Flashcards" subtitle="Active recall, made beautiful." />
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold">Biology · Cell Chapter</span>
          <span>{i + 1} / {deck.length}</span>
        </div>
        <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary transition-all" style={{ width: `${((i + 1) / deck.length) * 100}%` }} />
        </div>
        <button onClick={() => setFlip(!flip)} className="group w-full aspect-[16/10] rounded-3xl bg-gradient-hero p-1 shadow-elegant hover:shadow-glow transition">
          <div className="grid h-full w-full place-items-center rounded-[22px] bg-card p-8 text-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{flip ? "Answer" : "Question"}</div>
              <div className="mt-4 text-2xl font-bold leading-tight">{flip ? card.a : card.q}</div>
              <div className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Tap to flip</div>
            </div>
          </div>
        </button>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={prev} className="grid h-12 w-12 place-items-center rounded-full border border-border bg-card shadow-soft hover:shadow-elegant transition"><ChevronLeft className="h-5 w-5" /></button>
          <button className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant"><Sparkles className="h-4 w-4" /> Generate with AI</button>
          <button onClick={next} className="grid h-12 w-12 place-items-center rounded-full border border-border bg-card shadow-soft hover:shadow-elegant transition"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}