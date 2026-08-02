import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Copy,
  Pin,
  Plus,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  Download,
  Layers,
  HelpCircle,
} from "lucide-react";
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
  LoadingBlock,
  ErrorBlock,
} from "@/components/feature-kit";
import { listNotes, createNote, updateNote, deleteNote, duplicateNote, runNoteAiAction, type Note } from "@/lib/notes.functions";
import { generateDeck } from "@/lib/flashcards.functions";
import { generateQuiz } from "@/lib/quizzes.functions";

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Coretex" },
      { name: "description", content: "Write, organise and supercharge your study notes with AI." },
      { property: "og:title", content: "Notes — Coretex" },
      { property: "og:description", content: "Write, organise and supercharge your study notes with AI." },
    ],
  }),
  component: Page,
});

type Draft = { id?: string; title: string; content: string; folder: string; tags: string };
const emptyDraft: Draft = { title: "", content: "", folder: "General", tags: "" };

function Page() {
  const qc = useQueryClient();
  const fetchNotes = useServerFn(listNotes);
  const create = useServerFn(createNote);
  const update = useServerFn(updateNote);
  const remove = useServerFn(deleteNote);
  const dupe = useServerFn(duplicateNote);
  const aiAction = useServerFn(runNoteAiAction);
  const makeDeck = useServerFn(generateDeck);
  const makeQuiz = useServerFn(generateQuiz);

  const notesQuery = useQuery({ queryKey: ["notes"], queryFn: () => fetchNotes() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [aiOpen, setAiOpen] = useState<{ title: string; text: string } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notes"] });

  const saveMut = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        title: d.title.trim() || "Untitled note",
        content: d.content,
        folder: d.folder.trim() || "General",
        tags: d.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      return d.id ? update({ data: { id: d.id, patch: payload } }) : create({ data: payload });
    },
    onSuccess: () => {
      setDraft(null);
      invalidate();
      toast.success("Note saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patchMut = useMutation({
    mutationFn: (v: { id: string; patch: Record<string, unknown> }) => update({ data: v }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Note deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const aiMut = useMutation({
    mutationFn: (v: { id: string; action: "summarize" | "rewrite" | "explain" | "expand" | "study_guide" | "mind_map"; label: string }) =>
      aiAction({ data: { id: v.id, action: v.action } }).then((r) => ({ ...r, label: v.label })),
    onSuccess: (r) => {
      setAiOpen({ title: r.label, text: r.text });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deckMut = useMutation({
    mutationFn: (n: Note) => makeDeck({ data: { topic: n.title, noteId: n.id, count: 10, folder: n.folder } }),
    onSuccess: () => toast.success("Flashcard deck created — see Flashcards"),
    onError: (e: Error) => toast.error(e.message),
  });

  const quizMut = useMutation({
    mutationFn: (n: Note) => makeQuiz({ data: { topic: n.title, subject: n.folder, noteId: n.id, count: 8 } }),
    onSuccess: () => toast.success("Quiz created — see Quizzes"),
    onError: (e: Error) => toast.error(e.message),
  });

  const notes = notesQuery.data ?? [];
  const folders = useMemo(() => Array.from(new Set(notes.map((n) => n.folder))).slice(0, 6), [notes]);

  const visible = notes.filter((n) => {
    if (filter === "archived" ? !n.is_archived : n.is_archived) return false;
    if (filter === "favorites" && !n.is_favorite) return false;
    if (filter === "pinned" && !n.is_pinned) return false;
    if (folders.includes(filter) && n.folder !== filter) return false;
    const needle = q.toLowerCase().trim();
    if (!needle) return true;
    return (
      n.title.toLowerCase().includes(needle) ||
      n.content.toLowerCase().includes(needle) ||
      n.tags.some((t) => t.toLowerCase().includes(needle))
    );
  });

  function exportNote(n: Note) {
    const blob = new Blob([`# ${n.title}\n\n${n.content}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${n.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Notes" subtitle="Your smart notebooks, powered by AI.">
        <PrimaryButton onClick={() => setDraft(emptyDraft)}>
          <Plus className="h-4 w-4" /> New note
        </PrimaryButton>
      </PageHeader>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search notes, tags and content…" />
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "pinned", label: "Pinned" },
            { value: "favorites", label: "Favourites" },
            { value: "archived", label: "Archived" },
            ...folders.map((f) => ({ value: f, label: f })),
          ]}
        />
      </Toolbar>

      {notesQuery.isLoading ? (
        <LoadingBlock label="Loading your notes…" />
      ) : notesQuery.isError ? (
        <ErrorBlock message="We couldn't load your notes." onRetry={() => notesQuery.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={notes.length === 0 ? "No notes yet" : "Nothing matches that"}
          description={
            notes.length === 0
              ? "Create your first note to start building your knowledge base."
              : "Try a different search term or filter."
          }
          actionLabel={notes.length === 0 ? "Create a note" : undefined}
          onAction={notes.length === 0 ? () => setDraft(emptyDraft) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((n) => (
            <article
              key={n.id}
              className="group flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => setDraft({ id: n.id, title: n.title, content: n.content, folder: n.folder, tags: n.tags.join(", ") })} className="min-w-0 text-left">
                  <h3 className="truncate font-bold">{n.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{n.folder} · {new Date(n.updated_at).toLocaleDateString()}</p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <IconToggle active={n.is_pinned} title="Pin" onClick={() => patchMut.mutate({ id: n.id, patch: { is_pinned: !n.is_pinned } })}>
                    <Pin className="h-3.5 w-3.5" />
                  </IconToggle>
                  <IconToggle active={n.is_favorite} title="Favourite" onClick={() => patchMut.mutate({ id: n.id, patch: { is_favorite: !n.is_favorite } })}>
                    <Star className="h-3.5 w-3.5" />
                  </IconToggle>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{n.content || "Empty note"}</p>

              {n.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                <GhostButton title="AI summarize" disabled={aiMut.isPending} onClick={() => aiMut.mutate({ id: n.id, action: "summarize", label: "AI summary" })}>
                  <Sparkles className="h-3.5 w-3.5" /> Summarize
                </GhostButton>
                <GhostButton title="AI explain" disabled={aiMut.isPending} onClick={() => aiMut.mutate({ id: n.id, action: "explain", label: "AI explanation" })}>
                  Explain
                </GhostButton>
                <GhostButton title="Study guide" disabled={aiMut.isPending} onClick={() => aiMut.mutate({ id: n.id, action: "study_guide", label: "Study guide" })}>
                  Guide
                </GhostButton>
                <GhostButton title="Generate flashcards" disabled={deckMut.isPending} onClick={() => deckMut.mutate(n)}>
                  <Layers className="h-3.5 w-3.5" /> Cards
                </GhostButton>
                <GhostButton title="Generate quiz" disabled={quizMut.isPending} onClick={() => quizMut.mutate(n)}>
                  <HelpCircle className="h-3.5 w-3.5" /> Quiz
                </GhostButton>
                <GhostButton title="Duplicate" onClick={() => dupe({ data: { id: n.id } }).then(invalidate)}>
                  <Copy className="h-3.5 w-3.5" />
                </GhostButton>
                <GhostButton title="Export as markdown" onClick={() => exportNote(n)}>
                  <Download className="h-3.5 w-3.5" />
                </GhostButton>
                <GhostButton
                  title={n.is_archived ? "Restore" : "Archive"}
                  onClick={() => patchMut.mutate({ id: n.id, patch: { is_archived: !n.is_archived } })}
                >
                  {n.is_archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                </GhostButton>
                <GhostButton title="Delete" onClick={() => confirm(`Delete "${n.title}"?`) && deleteMut.mutate(n.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </GhostButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit note" : "New note"} wide>
        {draft && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMut.mutate(draft);
            }}
          >
            <TextField label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. Photosynthesis" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Folder" value={draft.folder} onChange={(v) => setDraft({ ...draft, folder: v })} placeholder="Biology" />
              <TextField label="Tags (comma separated)" value={draft.tags} onChange={(v) => setDraft({ ...draft, tags: v })} placeholder="exam, chapter-3" />
            </div>
            <TextField label="Content (markdown supported)" value={draft.content} onChange={(v) => setDraft({ ...draft, content: v })} textarea rows={12} />
            <div className="flex justify-end gap-2">
              <GhostButton onClick={() => setDraft(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" loading={saveMut.isPending}>Save note</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!aiOpen} onClose={() => setAiOpen(null)} title={aiOpen?.title ?? "AI"} wide>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiOpen?.text}</div>
      </Modal>

      {aiMut.isPending && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gradient-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-elegant">
          Coretex AI is thinking…
        </div>
      )}
    </div>
  );
}

function IconToggle({ active, title, onClick, children }: { active: boolean; title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-full border transition ${
        active ? "border-primary bg-gradient-soft text-primary" : "border-border text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
