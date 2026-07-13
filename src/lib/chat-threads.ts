import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "coretex.chat.threads.v1";

function safeParse(raw: string | null): ChatThread[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY)).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
}

export function upsertThread(t: ChatThread) {
  const threads = loadThreads();
  const idx = threads.findIndex(x => x.id === t.id);
  if (idx >= 0) threads[idx] = t; else threads.unshift(t);
  saveThreads(threads);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter(t => t.id !== id));
}

export function newThreadId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function titleFromMessages(msgs: UIMessage[]): string {
  const first = msgs.find(m => m.role === "user");
  if (!first) return "New chat";
  const text = first.parts
    .map(p => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  return text.slice(0, 60) || "New chat";
}