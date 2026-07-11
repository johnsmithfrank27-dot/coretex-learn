import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, Zap, BookOpen, Languages, HelpCircle, Layers, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import mascot from "@/assets/ai-mascot.png";

export const Route = createFileRoute("/_app/ai-tutor")({ component: AiTutor });

const actions = [
  { i: BookOpen, l: "Explain" }, { i: Zap, l: "Simplify" }, { i: FileText, l: "Summarize" },
  { i: HelpCircle, l: "Quiz Me" }, { i: Layers, l: "Flashcards" }, { i: Languages, l: "Translate" },
];

function AiTutor() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="AI Tutor" subtitle="Your personal learning companion, available 24/7." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col min-h-[600px]">
          <div className="border-b border-border bg-gradient-soft p-5 flex items-center gap-4">
            <img src={mascot} alt="AI" className="h-14 w-14 object-contain" width={56} height={56} />
            <div>
              <div className="font-bold">Coretex AI</div>
              <div className="text-xs text-success font-semibold">● Online — powered by GPT-class models</div>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <Msg role="ai">Hi Frank! What would you like to learn today? I can explain concepts, generate quizzes, or summarize notes.</Msg>
            <Msg role="me">Can you explain Newton's second law?</Msg>
            <Msg role="ai">Newton's second law says <b>F = ma</b> — the force acting on an object equals its mass times its acceleration. Push a heavier cart with the same force and it accelerates less. Want a quick quiz on it?</Msg>
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {actions.map((a) => {
                const I = a.i;
                return (
                  <button key={a.l} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:bg-accent transition">
                    <I className="h-3.5 w-3.5 text-primary" /> {a.l}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-4 pr-1 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <input placeholder="Ask AI anything…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-gradient-soft p-5 shadow-soft">
            <h3 className="font-bold">Suggested for you</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["Solve calculus problem", "Summarize Chapter 4", "Practice French vocab", "Generate 10 quiz Qs"].map((s) => (
                <li key={s} className="rounded-xl bg-white/70 px-3 py-2 hover:bg-white transition cursor-pointer">{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-bold">Recent chats</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Cell mitochondria</li><li>Quadratic equations</li><li>Photosynthesis basics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Msg({ role, children }: { role: "ai" | "me"; children: React.ReactNode }) {
  if (role === "me") return <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground">{children}</div>;
  return <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm leading-relaxed">{children}</div>;
}