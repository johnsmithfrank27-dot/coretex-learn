import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, Zap, BookOpen, Languages, HelpCircle, Layers, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import mascot from "@/assets/ai-mascot.png";

export const Route = createFileRoute("/app/ai-tutor")({ component: AiTutor });

const actions = [
  { i: BookOpen, l: "Explain", p: "Explain this topic simply: " },
  { i: Zap, l: "Simplify", p: "Simplify this for me: " },
  { i: FileText, l: "Summarize", p: "Summarize: " },
  { i: HelpCircle, l: "Quiz Me", p: "Quiz me on: " },
  { i: Layers, l: "Flashcards", p: "Make 5 flashcards for: " },
  { i: Languages, l: "Translate", p: "Translate to French: " },
];

type ChatMsg = { role: "user" | "assistant"; content: string };

function AiTutor() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi Frank! What would you like to learn today? I can explain concepts, generate quizzes, or summarize notes." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Sorry — something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="AI Tutor" subtitle="Your personal learning companion, available 24/7." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col min-h-[600px]">
          <div className="border-b border-border bg-gradient-soft p-5 flex items-center gap-4">
            <img src={mascot} alt="AI" className="h-14 w-14 object-contain" width={56} height={56} />
            <div>
              <div className="font-bold">Coretex AI</div>
              <div className="text-xs text-success font-semibold">● Online — powered by Qwen 3 32B</div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[520px]">
            {messages.map((m, i) => (
              <Msg key={i} role={m.role === "user" ? "me" : "ai"}>
                {m.content || (loading && i === messages.length - 1 ? <span className="opacity-60">Thinking…</span> : "")}
              </Msg>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {actions.map((a) => {
                const I = a.i;
                return (
                  <button key={a.l} onClick={() => setInput(a.p)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:bg-accent transition">
                    <I className="h-3.5 w-3.5 text-primary" /> {a.l}
                  </button>
                );
              })}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-4 pr-1 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask AI anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <button type="submit" disabled={loading || !input.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-gradient-soft p-5 shadow-soft">
            <h3 className="font-bold">Suggested for you</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["Solve calculus problem", "Summarize Chapter 4", "Practice French vocab", "Generate 10 quiz Qs"].map((s) => (
                <li key={s} onClick={() => send(s)} className="rounded-xl bg-white/70 px-3 py-2 hover:bg-white transition cursor-pointer">{s}</li>
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
  if (role === "me") return <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap">{children}</div>;
  return <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{children}</div>;
}