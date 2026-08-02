import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Layers, Plus, Sparkles, Star, Bookmark, Trash2, Play, Pencil } from "lucide-react";
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
  ProgressBar,
} from "@/components/feature-kit";
import {
  listDecks,
  listCards,
  createDeck,
  updateDeck,
  deleteDeck,
  upsertCard,
  deleteCard,
  reviewCard,
  generateDeck,
  type Deck,
  type Card,
} from "@/lib/flashcards.functions";

export const Route = createFileRoute("/app/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Coretex" },
      { name: "description", content: "Build decks and master them with AI-generated cards and spaced repetition." },
      { property: "og:title", content: "Flashcards — Coretex" },
      { property: "og:description", content: "Build decks and master them with AI-generated cards and spaced repetition." },
    ],
  }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchDecks = useServerFn(listDecks);
  const create = useServerFn(createDeck);
  const update = useServerFn(updateDeck);
  const remove = useServerFn(deleteDeck);
  const gen = useServerFn(generateDeck);

  const decksQuery = useQuery({ queryKey: ["decks"], queryFn: () => fetchDecks() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState("General");
  const [creating, setCreating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [manage, setManage] = useState<Deck | null>(null);
  const [study, setStudy] = useState<Deck | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["decks"] });

  const createMut = useMutation({
    mutationFn: () => create({ data: { title: newTitle.trim(), folder: newFolder.trim() || "General", category: newFolder.trim() || "General", difficulty: "medium" } }),
    onSuccess: () => {
      setCreating(false);
      setNewTitle("");
      invalidate();
      toast.success("Deck created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const genMut = useMutation({
    mutationFn: () => gen({ data: { topic: aiTopic.trim(), count: 10, folder: "AI decks" } }),
    onSuccess: () => {
      setAiOpen(false);
      setAiTopic("");
      invalidate();
      toast.success("AI deck ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patchMut = useMutation({
    mutationFn: (v: { id: string; patch: Record<string, unknown> }) => update({ data: v }),
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Deck deleted");
    },
  });

  const decks: Deck[] = decksQuery.data ?? [];
  const visible = decks.filter((d) => {
    if (filter === "favorites" && !d.is_favorite) return false;
    if (filter === "bookmarked" && !d.is_bookmarked) return false;
    if (filter === "ai" && d.source !== "ai") return false;
    const n = q.toLowerCase().trim();
    return !n || d.title.toLowerCase().includes(n) || d.folder.toLowerCase().includes(n);
  });

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Flashcards" subtitle="Practice with spaced repetition and AI-generated decks.">
        <GhostButton title="Generate with AI" onClick={() => setAiOpen(true)}>
          <Sparkles className="h-3.5 w-3.5" /> AI deck
        </GhostButton>
        <PrimaryButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New deck
        </PrimaryButton>
      </PageHeader>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search decks…" />
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "favorites", label: "Favourites" },
            { value: "bookmarked", label: "Saved" },
            { value: "ai", label: "AI generated" },
          ]}
        />
      </Toolbar>

      {decksQuery.isLoading ? (
        <LoadingBlock label="Loading your decks…" />
      ) : decksQuery.isError ? (
        <ErrorBlock message="We couldn't load your decks." onRetry={() => decksQuery.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={decks.length === 0 ? "No flashcard decks yet" : "Nothing matches that"}
          description={decks.length === 0 ? "Create a deck manually or let AI build one from any topic." : "Try another search or filter."}
          actionLabel={decks.length === 0 ? "Generate a deck with AI" : undefined}
          onAction={decks.length === 0 ? () => setAiOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => (
            <article key={d.id} className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold">{d.title}</h3>
                  <p className="text-xs text-muted-foreground">{d.folder} · {d.card_count} cards{d.source === "ai" ? " · AI" : ""}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button title="Favourite" aria-pressed={d.is_favorite} onClick={() => patchMut.mutate({ id: d.id, patch: { is_favorite: !d.is_favorite } })} className={`grid h-8 w-8 place-items-center rounded-full border transition ${d.is_favorite ? "border-primary bg-gradient-soft text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button title="Bookmark" aria-pressed={d.is_bookmarked} onClick={() => patchMut.mutate({ id: d.id, patch: { is_bookmarked: !d.is_bookmarked } })} className={`grid h-8 w-8 place-items-center rounded-full border transition ${d.is_bookmarked ? "border-primary bg-gradient-soft text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex-1">
                <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Mastery</span>
                  <span>{Math.round(Number(d.mastery_score))}%</span>
                </div>
                <ProgressBar value={Number(d.mastery_score)} />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                <GhostButton title="Study deck" onClick={() => setStudy(d)}>
                  <Play className="h-3.5 w-3.5" /> Study
                </GhostButton>
                <GhostButton title="Manage cards" onClick={() => setManage(d)}>
                  <Pencil className="h-3.5 w-3.5" /> Cards
                </GhostButton>
                <GhostButton title="Delete deck" onClick={() => confirm(`Delete "${d.title}"?`) && deleteMut.mutate(d.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </GhostButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New deck">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return toast.error("Give your deck a title");
            createMut.mutate();
          }}
        >
          <TextField label="Deck title" value={newTitle} onChange={setNewTitle} placeholder="e.g. Organic chemistry basics" />
          <TextField label="Folder" value={newFolder} onChange={setNewFolder} placeholder="Chemistry" />
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setCreating(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" loading={createMut.isPending}>Create deck</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="Generate a deck with AI">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!aiTopic.trim()) return toast.error("What topic should the cards cover?");
            genMut.mutate();
          }}
        >
          <TextField label="Topic" value={aiTopic} onChange={setAiTopic} placeholder="e.g. Newton's laws of motion" />
          <p className="text-xs text-muted-foreground">Coretex will write 10 high-quality cards you can edit afterwards.</p>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setAiOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" loading={genMut.isPending}>Generate</PrimaryButton>
          </div>
        </form>
      </Modal>

      {manage && <ManageCards deck={manage} onClose={() => { setManage(null); invalidate(); }} />}
      {study && <StudySession deck={study} onClose={() => { setStudy(null); invalidate(); }} />}
    </div>
  );
}

function useCards(deckId: string) {
  const fetchCards = useServerFn(listCards);
  return useQuery({ queryKey: ["cards", deckId], queryFn: () => fetchCards({ data: { deckId } }) });
}

function ManageCards({ deck, onClose }: { deck: Deck; onClose: () => void }) {
  const qc = useQueryClient();
  const cardsQuery = useCards(deck.id);
  const save = useServerFn(upsertCard);
  const del = useServerFn(deleteCard);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [editing, setEditing] = useState<string | undefined>();

  const refresh = () => qc.invalidateQueries({ queryKey: ["cards", deck.id] });

  const saveMut = useMutation({
    mutationFn: () => save({ data: { id: editing, deckId: deck.id, prompt: prompt.trim(), answer: answer.trim() } }),
    onSuccess: () => {
      setPrompt("");
      setAnswer("");
      setEditing(undefined);
      refresh();
      toast.success("Card saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id, deckId: deck.id } }),
    onSuccess: refresh,
  });

  const cards: Card[] = cardsQuery.data ?? [];

  return (
    <Modal open onClose={onClose} title={`Cards — ${deck.title}`} wide>
      <form
        className="mb-6 space-y-3 rounded-2xl border border-border bg-secondary/30 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!prompt.trim() || !answer.trim()) return toast.error("Both sides are required");
          saveMut.mutate();
        }}
      >
        <TextField label="Front (question)" value={prompt} onChange={setPrompt} textarea rows={2} />
        <TextField label="Back (answer)" value={answer} onChange={setAnswer} textarea rows={2} />
        <div className="flex justify-end gap-2">
          {editing && <GhostButton onClick={() => { setEditing(undefined); setPrompt(""); setAnswer(""); }}>Cancel edit</GhostButton>}
          <PrimaryButton type="submit" loading={saveMut.isPending}>{editing ? "Update card" : "Add card"}</PrimaryButton>
        </div>
      </form>

      {cardsQuery.isLoading ? (
        <LoadingBlock label="Loading cards…" />
      ) : cards.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No cards in this deck yet.</p>
      ) : (
        <ul className="space-y-2">
          {cards.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{c.prompt}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.answer}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <GhostButton title="Edit" onClick={() => { setEditing(c.id); setPrompt(c.prompt); setAnswer(c.answer); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </GhostButton>
                <GhostButton title="Delete" onClick={() => delMut.mutate(c.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </GhostButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function StudySession({ deck, onClose }: { deck: Deck; onClose: () => void }) {
  const cardsQuery = useCards(deck.id);
  const rate = useServerFn(reviewCard);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const cards: Card[] = cardsQuery.data ?? [];
  const card = cards[idx];

  async function answer(rating: "again" | "hard" | "good" | "easy") {
    if (!card) return;
    setDone((d) => d + 1);
    try {
      await rate({ data: { id: card.id, deckId: deck.id, rating } });
    } catch {
      toast.error("Couldn't save that review");
    }
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  return (
    <Modal open onClose={onClose} title={`Study — ${deck.title}`} wide>
      {cardsQuery.isLoading ? (
        <LoadingBlock label="Preparing your session…" />
      ) : cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">This deck has no cards yet. Add some first.</p>
      ) : !card ? (
        <div className="py-10 text-center">
          <h3 className="text-xl font-bold">Session complete</h3>
          <p className="mt-2 text-sm text-muted-foreground">You reviewed {done} card{done === 1 ? "" : "s"}. Mastery updated.</p>
          <div className="mt-6 flex justify-center gap-2">
            <GhostButton onClick={() => { setIdx(0); setDone(0); }}>Study again</GhostButton>
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <ProgressBar value={(idx / cards.length) * 100} />
            <p className="mt-2 text-xs text-muted-foreground">Card {idx + 1} of {cards.length}</p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="grid min-h-[220px] w-full place-items-center rounded-3xl border border-border bg-gradient-soft p-8 text-center transition-all hover:shadow-elegant"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{flipped ? "Answer" : "Question"}</p>
              <p className="mt-3 text-lg font-semibold">{flipped ? card.answer : card.prompt}</p>
              {!flipped && <p className="mt-4 text-xs text-muted-foreground">Tap to reveal</p>}
            </div>
          </button>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["again", "hard", "good", "easy"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={!flipped}
                onClick={() => answer(r)}
                className="h-11 rounded-full border border-border bg-card text-xs font-bold capitalize transition hover:bg-secondary disabled:opacity-40"
              >
                {r}
              </button>
            ))}
          </div>
          {!flipped && <p className="mt-3 text-center text-xs text-muted-foreground">Reveal the answer to rate your recall.</p>}
        </div>
      )}
    </Modal>
  );
}
