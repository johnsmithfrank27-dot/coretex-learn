import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy, Loader2, Pin, Plus, Search, Sparkles, Star, StickyNote, Trash2, Layers, X,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  createNote, deleteNote, duplicateNote, generateFlashcardsFromNote, listNotes,
  runNoteAiAction, updateNote, type Note,
} from "@/lib/notes.functions";

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Coretex" },
      { name: "description", content: "Write, organize and AI-enhance your study notes." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const qc = useQueryClient();
  const fetchNotes = useServerFn(listNotes);
  const create = useServerFn(createNote);
  const update = useServerFn(updateNote);
  const remove = useServerFn(deleteNote);
  const dupe = useServerFn(duplicateNote);
  const aiAction = useServerFn(runNoteAiAction);
  const genCards = useServerFn(generateFlashcardsFromNote);

  const { data: notes = [], isLoading } = useQuery({ queryKey: ["notes"], queryFn: () => fetchNotes() });

  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<string>("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; content: string; folder: string; tags: string }>({
    title: "", content: "", folder: "General", tags: "",
  });
  const [aiOut, setAiOut] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = notes.find((n) => n.id === activeId) ?? null;

  useEffect(() => {
    if (!active) return;
    setDraft({
      title: active.title,
      content: active.content,
      folder: active.folder,
      tags: (active.tags ?? []).join(", "),
    });
    setAiOut(active.ai_summary ?? null);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["notes"] });
    qc.invalidateQueries({ queryKey: ["decks"] });
  };

  const createMut = useMutation({
    mutationFn: () => create({ data: { title: "Untitled note", content: "", folder: "General", tags: [] } }),
    onSuccess: (n: Note) => {
      invalidate();
      setActiveId(n.id);
      toast.success("Note created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const folders = useMemo(
    () => ["All", ...Array.from(new Set(notes.map((n) => n.folder).filter(Boolean)))],
    [notes],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return notes.filter(
      (n) =>
        (folder === "All" || n.folder === folder) &&
        (!term ||
          n.title.toLowerCase().includes(term) ||
          n.content.toLowerCase().includes(term) ||
          (n.tags ?? []).some((t) => t.toLowerCase().includes(term))),
    );
  }, [notes, q, folder]);

  function scheduleSave(next: Partial<typeof draft>) {
    const merged = { ...draft, ...next };
    setDraft(merged);
    if (!activeId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await update({
          data: {
            id: activeId,
            patch: {
              title: merged.title || "Untitled note",
              content: merged.content,
              folder: merged.folder || "General",
              tags: merged.tags.split(",").map((t) => t.trim()).filter(Boolean),
            },
          },
        });
        qc.invalidateQueries({ queryKey: ["notes"] });
      } catch (e) {
        toast.error((e as Error).message);
      }
    }, 700);
  }

  async function toggle(note: Note, field: "is_pinned" | "is_favorite") {
    try {
      await update({ data: { id: note.id, patch: { [field]: !note[field] } } });
      qc.invalidateQueries({ queryKey: ["notes"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function runAi(action: "summarize" | "rewrite" | "explain" | "study_guide") {
    if (!activeId) return;
    setBusy(action);
    try {
      const res = await aiAction({ data: { id: activeId, action } });
      setAiOut(res.output);
      qc.invalidateQueries({ queryKey: ["notes"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Notes" subtitle="Your smart notebooks — written by you, sharpened by AI.">
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-60"
        >
          {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New note
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Create your first note to start building your knowledge base."
          actionLabel="Create a note"
          onAction={() => createMut.mutate()}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes, tags…"
                className="h-11 w-full rounded-xl border border-border bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFolder(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    folder === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveId(n.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    activeId === n.id ? "border-primary/50 bg-card shadow-elegant" : "border-border bg-card/60 hover:shadow-soft"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold truncate">{n.title}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                      {n.is_favorite && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {n.content || "Empty note"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2 py-0.5">{n.folder}</span>
                    <span>{new Date(n.updated_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No notes match that search.
                </p>
              )}
            </div>
          </aside>

          <section>
            {!active ? (
              <div className="grid h-full min-h-[300px] place-items-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
                Select a note to start editing.
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <input
                    value={draft.title}
                    onChange={(e) => scheduleSave({ title: e.target.value })}
                    className="min-w-0 flex-1 bg-transparent text-xl font-extrabold outline-none"
                    placeholder="Note title"
                  />
                  <div className="flex items-center gap-1.5">
                    <IconBtn label="Pin" onClick={() => toggle(active, "is_pinned")} active={active.is_pinned}>
                      <Pin className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Favorite" onClick={() => toggle(active, "is_favorite")} active={active.is_favorite}>
                      <Star className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Duplicate"
                      onClick={async () => {
                        await dupe({ data: { id: active.id } });
                        invalidate();
                        toast.success("Note duplicated");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      onClick={async () => {
                        await remove({ data: { id: active.id } });
                        setActiveId(null);
                        invalidate();
                        toast.success("Note deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={draft.folder}
                    onChange={(e) => scheduleSave({ folder: e.target.value })}
                    placeholder="Folder"
                    className="h-10 rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <input
                    value={draft.tags}
                    onChange={(e) => scheduleSave({ tags: e.target.value })}
                    placeholder="Tags, comma separated"
                    className="h-10 rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <textarea
                  value={draft.content}
                  onChange={(e) => scheduleSave({ content: e.target.value })}
                  placeholder="Start writing… headings, lists and math notation are all welcome."
                  className="mt-3 min-h-[320px] w-full resize-y rounded-2xl border border-border bg-secondary/20 p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-2 text-xs text-muted-foreground">Changes save automatically.</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <AiBtn busy={busy === "summarize"} onClick={() => runAi("summarize")}>Summarize</AiBtn>
                  <AiBtn busy={busy === "explain"} onClick={() => runAi("explain")}>Explain</AiBtn>
                  <AiBtn busy={busy === "rewrite"} onClick={() => runAi("rewrite")}>Rewrite</AiBtn>
                  <AiBtn busy={busy === "study_guide"} onClick={() => runAi("study_guide")}>Study guide</AiBtn>
                  <button
                    onClick={async () => {
                      setBusy("cards");
                      try {
                        const r = await genCards({ data: { id: active.id } });
                        invalidate();
                        toast.success(`${r.count} flashcards added to your decks`);
                      } catch (e) {
                        toast.error((e as Error).message);
                      } finally {
                        setBusy(null);
                      }
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-60"
                    disabled={busy === "cards"}
                  >
                    {busy === "cards" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
                    Generate flashcards
                  </button>
                </div>

                {aiOut && (
                  <div className="mt-5 rounded-2xl border border-primary/20 bg-gradient-soft p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                        <Sparkles className="h-3.5 w-3.5" /> AI output
                      </span>
                      <button onClick={() => setAiOut(null)} aria-label="Dismiss AI output">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{aiOut}</pre>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children, onClick, active, label,
}: { children: React.ReactNode; onClick: () => void; active?: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-secondary ${
        active ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function AiBtn({ children, onClick, busy }: { children: React.ReactNode; onClick: () => void; busy: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold hover:bg-secondary transition disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
      {children}
    </button>
  );
}
