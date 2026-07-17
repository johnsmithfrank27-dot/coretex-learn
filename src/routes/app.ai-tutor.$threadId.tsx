import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, Plus, Trash2, MessageSquare, Zap, BookOpen, Languages, HelpCircle, Layers, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import mascot from "@/assets/ai-mascot.png";
import {
  loadThreads, upsertThread, deleteThread, newThreadId, titleFromMessages,
  type ChatThread,
} from "@/lib/chat-threads";

export const Route = createFileRoute("/app/ai-tutor/$threadId")({
  head: () => ({ meta: [{ title: "AI Tutor — Coretex" }] }),
  component: AiTutorThread,
});

const quickActions = [
  { i: BookOpen, l: "Explain", p: "Explain this topic simply: " },
  { i: Zap, l: "Simplify", p: "Simplify this for me: " },
  { i: FileText, l: "Summarize", p: "Summarize: " },
  { i: HelpCircle, l: "Quiz Me", p: "Quiz me on: " },
  { i: Layers, l: "Flashcards", p: "Make 5 flashcards for: " },
  { i: Languages, l: "Translate", p: "Translate to French: " },
];

function AiTutorThread() {
  const { threadId } = useParams({ from: "/app/ai-tutor/$threadId" });
  const nav = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Load thread list + initial messages for this thread (browser only)
  const initial = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const t = loadThreads().find(x => x.id === threadId);
    return t?.messages ?? [];
  }, [threadId]);

  useEffect(() => { setThreads(loadThreads()); }, [threadId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    messages: initial,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  // Persist thread whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;
    upsertThread({
      id: threadId,
      title: titleFromMessages(messages),
      updatedAt: Date.now(),
      messages,
    });
    setThreads(loadThreads());
  }, [messages, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, [threadId]);

  const isLoading = status === "submitted" || status === "streaming";

  function handleSend(text: string) {
    const t = text.trim();
    if (!t || isLoading) return;
    sendMessage({ text: t });
    setInput("");
  }

  function handleNewChat() {
    const id = newThreadId();
    nav({ to: "/app/ai-tutor/$threadId", params: { threadId: id } });
  }

  function handleDelete(id: string) {
    deleteThread(id);
    const rest = loadThreads();
    setThreads(rest);
    if (id === threadId) {
      if (rest[0]) nav({ to: "/app/ai-tutor/$threadId", params: { threadId: rest[0].id } });
      else handleNewChat();
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="AI Tutor" subtitle="Your personal learning companion. Every chat is saved on this device." />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Threads sidebar */}
        <aside className="rounded-3xl border border-border bg-card shadow-soft flex flex-col max-h-[640px]">
          <div className="p-3 border-b border-border">
            <button onClick={handleNewChat} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-elegant transition">
              <Plus className="h-4 w-4" /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">No conversations yet. Send a message to start.</div>
            ) : threads.map(t => (
              <div key={t.id} className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition ${t.id === threadId ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                <button onClick={() => nav({ to: "/app/ai-tutor/$threadId", params: { threadId: t.id } })} className="flex-1 min-w-0 flex items-center gap-2 text-left">
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </button>
                <button onClick={() => handleDelete(t.id)} title="Delete" className="opacity-0 group-hover:opacity-100 grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col min-h-[640px]">
          <div className="border-b border-border bg-gradient-soft p-5 flex items-center gap-4">
            <img src={mascot} alt="AI mascot" className="h-14 w-14 object-contain" width={56} height={56} />
            <div className="flex-1 min-w-0">
              <div className="font-bold">Coretex AI</div>
              <div className="text-xs text-success font-semibold">● Online — powered by Lovable AI</div>
            </div>
            <button onClick={() => { setMessages([]); deleteThread(threadId); handleNewChat(); }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Clear</button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[520px]">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <div className="mb-2">Hi! I'm Coretex AI. Ask me anything — a concept to explain, notes to summarize, or a quiz to practice.</div>
              </div>
            )}
            {messages.map(m => (
              <Msg key={m.id} role={m.role === "user" ? "me" : "ai"}>
                {m.parts.map((p, i) => {
                  if (p.type === "text") return <span key={i}>{p.text}</span>;
                  if (p.type.startsWith("tool-")) {
                    const name = p.type.slice(5);
                    return (
                      <span key={i} className="mt-2 block rounded-lg bg-background/60 px-2 py-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">⚡ {name}</span>
                      </span>
                    );
                  }
                  return null;
                })}
              </Msg>
            ))}
            {status === "submitted" && (
              <Msg role="ai"><span className="opacity-60">Thinking…</span></Msg>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickActions.map(a => {
                const I = a.i;
                return (
                  <button key={a.l} onClick={() => { setInput(a.p); inputRef.current?.focus(); }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:bg-accent transition">
                    <I className="h-3.5 w-3.5 text-primary" /> {a.l}
                  </button>
                );
              })}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-4 pr-1 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask AI anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
                autoFocus
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Msg({ role, children }: { role: "ai" | "me"; children: React.ReactNode }) {
  if (role === "me") return <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap">{children}</div>;
  return <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{children}</div>;
}