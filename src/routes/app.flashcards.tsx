import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Layers, Loader2, Plus, Search, Sparkles, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  createCard, createDeck, deleteCard, deleteDeck, generateDeckFromTopic, listCards, listDecks,
  reviewCard, updateDeck, type Card, type Deck,
} from "@/lib/flashcards.functions";

export const Route = createFileRoute("/app/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Coretex" },
      { name: "description", content: "Build decks and master them with spaced repetition." },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const qc = useQueryClient();
  const fetchDecks = useServerFn(listDecks);
  const create = useServerFn(createDeck);
  const update = useServerFn(updateDeck);
  const remove = useServerFn(deleteDeck);
  const generate = useServerFn(generateDeckFromTopic);

  const { data: decks = [], isLoading } = useQuery({ queryKey: ["decks"], queryFn: () => fetchDecks() });
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return decks.filter((d) => !t || d.title.toLowerCase().includes(t) || d.category.toLowerCase().includes(t));
  }, [decks, q]);

  const createMut = useMutation({
    mutationFn: () => create({ data: { title: title.trim(), category: "General", difficulty: "medium" } }),
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const genMut = useMutation({
    mutationFn: () => generate({ data: { topic: topic.trim(), category: "General", count: 10 } }),
    onSuccess: () => {
      setTopic("");
      qc.invalidateQueries({ queryKey: ["decks"] });
      toast.success("AI deck ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (openDeck) {
    return <DeckView deck={openDeck} onBack={() => setOpenDeck(null)} />;
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Flashcards" subtitle="Practice with spaced repetition." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) createMut.mutate(); }}
          className="flex gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New deck title"
            className="h-10 flex-1 rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold hover:bg-secondary transition disabled:opacity-60" disabled={createMut.isPending}>
            {createMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Create
          </button>
        </form>
        <form
          onSubmit={(e) => { e.preventDefault(); if (topic.trim()) genMut.mutate(); }}
          className="flex gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft"
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Generate a deck about…"
            className="h-10 flex-1 rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-60" disabled={genMut.isPending}>
            {genMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI deck
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : decks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcard decks yet"
          description="Create a deck above, generate one with AI, or turn any note into flashcards."
          actionLabel="Go to Notes"
          actionTo="/app/notes"
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search decks…"
              className="h-11 w-full rounded-xl border border-border bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <div key={d.id} className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elegant">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-tight">{d.title}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Favorite deck"
                      onClick={async () => {
                        await update({ data: { id: d.id, patch: { is_favorite: !d.is_favorite } } });
                        qc.invalidateQueries({ queryKey: ["decks"] });
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                    >
                      <Star className={`h-4 w-4 ${d.is_favorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button
                      aria-label="Delete deck"
                      onClick={async () => {
                        await remove({ data: { id: d.id } });
                        qc.invalidateQueries({ queryKey: ["decks"] });
                        toast.success("Deck deleted");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{d.category}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5">{d.card_count} cards</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5">{d.source}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Mastery</span><span>{Math.round(Number(d.mastery_score))}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, Number(d.mastery_score))}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => setOpenDeck(d)}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all"
                >
                  Study deck
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DeckView({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const qc = useQueryClient();
  const fetchCards = useServerFn(listCards);
  const addCard = useServerFn(createCard);
  const delCard = useServerFn(deleteCard);
  const review = useServerFn(reviewCard);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["cards", deck.id],
    queryFn: () => fetchCards({ data: { deckId: deck.id } }),
  });

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const current: Card | undefined = cards[idx];

  async function rate(rating: "again" | "hard" | "good" | "easy") {
    if (!current) return;
    try {
      await review({ data: { id: current.id, deckId: deck.id, rating } });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["cards", deck.id] });
    } catch (e) {
      toast.error((e as Error).message);
    }
    setFlipped(false);
    setIdx((i) => (i + 1) % Math.max(1, cards.length));
  }

  return (
    <div className="p-6 lg:p-8">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All decks
      </button>
      <PageHeader title={deck.title} subtitle={`${cards.length} cards · ${deck.category}`} />

      {isLoading ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            {current ? (
              <>
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="min-h-[260px] w-full rounded-3xl border border-border bg-card p-8 text-left shadow-soft transition-all hover:shadow-elegant"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    {flipped ? "Answer" : "Question"} · {idx + 1}/{cards.length}
                  </span>
                  <p className="mt-4 text-lg font-semibold leading-relaxed">
                    {flipped ? current.answer : current.prompt}
                  </p>
                  {!flipped && current.hint && (
                    <p className="mt-3 text-sm text-muted-foreground">Hint: {current.hint}</p>
                  )}
                  <p className="mt-6 text-xs text-muted-foreground">Tap the card to flip</p>
                </button>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {(["again", "hard", "good", "easy"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => rate(r)}
                      className="h-11 rounded-full border border-border bg-background text-xs font-semibold capitalize hover:bg-secondary transition"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon={Layers} title="This deck is empty" description="Add your first card using the form beside this panel." />
            )}
          </div>

          <aside className="space-y-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!prompt.trim() || !answer.trim()) return;
                await addCard({ data: { deckId: deck.id, prompt: prompt.trim(), answer: answer.trim() } });
                setPrompt(""); setAnswer("");
                qc.invalidateQueries({ queryKey: ["cards", deck.id] });
                qc.invalidateQueries({ queryKey: ["decks"] });
                toast.success("Card added");
              }}
              className="rounded-3xl border border-border bg-card p-5 shadow-soft"
            >
              <h3 className="mb-3 font-bold">Add a card</h3>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question" className="mb-2 min-h-[70px] w-full rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" className="mb-3 min-h-[70px] w-full rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
                <Plus className="h-4 w-4" /> Add card
              </button>
            </form>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-bold">Cards</h3>
              <ul className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                {cards.map((c, i) => (
                  <li key={c.id} className="flex items-start justify-between gap-2 rounded-xl bg-secondary/40 p-3">
                    <button onClick={() => { setIdx(i); setFlipped(false); }} className="min-w-0 flex-1 text-left text-xs">
                      <span className="line-clamp-2 font-medium">{c.prompt}</span>
                      <span className="text-[11px] text-muted-foreground">{c.review_count} reviews</span>
                    </button>
                    <button
                      aria-label="Delete card"
                      onClick={async () => {
                        await delCard({ data: { id: c.id, deckId: deck.id } });
                        setIdx(0);
                        qc.invalidateQueries({ queryKey: ["cards", deck.id] });
                        qc.invalidateQueries({ queryKey: ["decks"] });
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {cards.length === 0 && <li className="text-sm text-muted-foreground">No cards yet.</li>}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
