import { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send, X, Zap } from "lucide-react";

type Ctx = { open: () => void; close: () => void; toggle: () => void; isOpen: boolean };
const AiCtx = createContext<Ctx | null>(null);

export function useAiAssistant() {
  const c = useContext(AiCtx);
  if (!c) throw new Error("useAiAssistant must be used inside AiAssistantProvider");
  return c;
}

export function AiAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo<Ctx>(() => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(v => !v),
    isOpen,
  }), [isOpen]);
  return (
    <AiCtx.Provider value={value}>
      {children}
      <AiAssistantPanel />
    </AiCtx.Provider>
  );
}

function AiAssistantPanel() {
  const { isOpen, close } = useAiAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    [],
  );
  const { messages, sendMessage, status } = useChat({
    id: "global-assistant",
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || isLoading) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <>
      {/* Floating trigger — visible on every page */}
      <button
        onClick={() => (isOpen ? close() : (window.dispatchEvent(new CustomEvent("ai:open")), null))}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition"
        aria-label="Open Coretex AI"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Slide-over */}
      <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-card border-l border-border shadow-elegant flex flex-col transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center gap-3 border-b border-border p-4 bg-gradient-soft">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">Coretex AI</div>
              <div className="text-xs text-success font-semibold">● Ready to help on this page</div>
            </div>
            <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Hi! I'm Coretex AI. Ask me to explain a concept, schedule study sessions, update your profile, or plan your week — I can act right here without leaving this page.</p>
                <ul className="mt-3 space-y-1 text-xs">
                  <li>• "Add an exam on Friday at 9am"</li>
                  <li>• "What's on my schedule this week?"</li>
                  <li>• "Explain photosynthesis simply"</li>
                </ul>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-primary px-3.5 py-2 text-sm text-primary-foreground whitespace-pre-wrap" : "max-w-[95%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap"}>
                {m.parts.map((p, i) => {
                  if (p.type === "text") return <span key={i}>{p.text}</span>;
                  if (p.type.startsWith("tool-")) {
                    return (
                      <span key={i} className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-background/60 px-2 py-0.5 text-[11px] text-primary font-semibold">
                        <Zap className="h-3 w-3" /> {p.type.slice(5)}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {status === "submitted" && (
              <div className="max-w-[95%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2 text-sm opacity-60">Thinking…</div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-4 pr-1 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask AI to do anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </>
  );
}