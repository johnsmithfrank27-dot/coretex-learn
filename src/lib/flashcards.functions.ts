import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateStructured } from "@/lib/ai-json.server";

export type Deck = {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  folder: string;
  difficulty: string;
  deck_type: string;
  is_bookmarked: boolean;
  is_favorite: boolean;
  source: string;
  card_count: number;
  due_today: number;
  mastery_score: number;
  created_at: string;
  updated_at: string;
};

export type Card = {
  id: string;
  flashcard_id: string;
  prompt: string;
  answer: string;
  hint: string | null;
  difficulty: string;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
};

const DeckInput = z.object({
  title: z.string().min(1).max(160),
  category: z.string().max(60).default("General"),
  folder: z.string().max(80).default("General"),
  difficulty: z.string().max(20).default("medium"),
  is_bookmarked: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
});

async function syncCount(supabase: any, deckId: string) {
  const { count } = await supabase
    .from("flashcard_items")
    .select("id", { count: "exact", head: true })
    .eq("flashcard_id", deckId);
  await supabase.from("flashcards").update({ card_count: count ?? 0 }).eq("id", deckId);
}

export const listDecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("flashcards")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Deck[];
  });

export const listCards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ deckId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("flashcard_items")
      .select("*")
      .eq("flashcard_id", data.deckId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Card[];
  });

export const createDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => DeckInput.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("flashcards")
      .insert({ ...data, owner_id: context.userId, source: "manual", deck_type: "standard" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Deck;
  });

export const updateDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), patch: DeckInput.partial() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("flashcards")
      .update(data.patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Deck;
  });

export const deleteDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await context.supabase.from("flashcard_items").delete().eq("flashcard_id", data.id);
    const { error } = await context.supabase.from("flashcards").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        deckId: z.string().uuid(),
        prompt: z.string().min(1).max(2000),
        answer: z.string().min(1).max(4000),
        hint: z.string().max(500).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase
        .from("flashcard_items")
        .update({ prompt: data.prompt, answer: data.answer, hint: data.hint ?? null })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("flashcard_items").insert({
        flashcard_id: data.deckId,
        prompt: data.prompt,
        answer: data.answer,
        hint: data.hint ?? null,
      });
      if (error) throw new Error(error.message);
    }
    await syncCount(context.supabase, data.deckId);
    return { ok: true };
  });

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), deckId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("flashcard_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await syncCount(context.supabase, data.deckId);
    return { ok: true };
  });

/** Spaced repetition rating: again / hard / good / easy. */
export const reviewCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        deckId: z.string().uuid(),
        rating: z.enum(["again", "hard", "good", "easy"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: card } = await context.supabase
      .from("flashcard_items")
      .select("review_count")
      .eq("id", data.id)
      .single();
    const difficulty = data.rating === "again" ? "hard" : data.rating === "hard" ? "medium" : "easy";
    await context.supabase
      .from("flashcard_items")
      .update({
        review_count: (card?.review_count ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        difficulty,
      })
      .eq("id", data.id);

    // Recompute deck mastery from card ratings.
    const { data: items } = await context.supabase
      .from("flashcard_items")
      .select("difficulty,review_count")
      .eq("flashcard_id", data.deckId);
    const list = items ?? [];
    const reviewed = list.filter((c) => (c.review_count ?? 0) > 0);
    const score = reviewed.length
      ? Math.round(
          (reviewed.reduce((s, c) => s + (c.difficulty === "easy" ? 1 : c.difficulty === "medium" ? 0.6 : 0.25), 0) /
            reviewed.length) *
            100,
        )
      : 0;
    await context.supabase
      .from("flashcards")
      .update({ mastery_score: score, due_today: list.length - reviewed.length })
      .eq("id", data.deckId);
    return { ok: true, mastery: score };
  });

/** Generate a deck of cards with AI from a topic, a note, or pasted text. */
export const generateDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        topic: z.string().min(1).max(200),
        sourceText: z.string().max(20000).optional(),
        noteId: z.string().uuid().optional(),
        count: z.number().int().min(3).max(20).default(10),
        folder: z.string().max(80).default("General"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    let source = data.sourceText ?? "";
    if (data.noteId) {
      const { data: note } = await context.supabase
        .from("notes")
        .select("title,content")
        .eq("id", data.noteId)
        .maybeSingle();
      if (note) source = `${note.title}\n\n${note.content}`;
    }

    const gen = await generateStructured({
      schema: z.object({
        cards: z
          .array(z.object({ prompt: z.string(), answer: z.string(), hint: z.string().optional() }))
          .min(1),
      }),
      system:
        "You create high-quality study flashcards. Prompts are short and specific; answers are precise and self-contained.",
      prompt: `Create ${data.count} flashcards about "${data.topic}".${source ? `\n\nBase them on this material:\n${source.slice(0, 12000)}` : ""}`,
    });

    const { data: deck, error } = await context.supabase
      .from("flashcards")
      .insert({
        owner_id: context.userId,
        title: data.topic,
        category: data.topic,
        folder: data.folder,
        difficulty: "medium",
        deck_type: "standard",
        source: "ai",
        card_count: gen.cards.length,
        due_today: gen.cards.length,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const { error: itemsErr } = await context.supabase.from("flashcard_items").insert(
      gen.cards.map((c) => ({
        flashcard_id: (deck as Deck).id,
        prompt: c.prompt,
        answer: c.answer,
        hint: c.hint ?? null,
      })),
    );
    if (itemsErr) throw new Error(itemsErr.message);
    return deck as Deck;
  });