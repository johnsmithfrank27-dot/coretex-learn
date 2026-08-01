import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Deck = {
  id: string;
  owner_id: string;
  title: string;
  category: string;
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
  .inputValidator((input: unknown) => z.object({ deckId: z.string().uuid() }).parse(input))
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
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        category: z.string().max(80).default("General"),
        difficulty: z.string().max(20).default("medium"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("flashcards")
      .insert({ ...data, owner_id: context.userId, source: "manual", deck_type: "manual" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Deck;
  });

export const updateDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        patch: z
          .object({
            title: z.string().min(1).max(200).optional(),
            category: z.string().max(80).optional(),
            difficulty: z.string().max(20).optional(),
            is_favorite: z.boolean().optional(),
            is_bookmarked: z.boolean().optional(),
          })
          .strict(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("flashcards")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Deck;
  });

export const deleteDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase.from("flashcard_items").delete().eq("flashcard_id", data.id);
    const { error } = await context.supabase.from("flashcards").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function syncDeckCounts(
  supabase: { from: (t: string) => any },
  deckId: string,
) {
  const { count } = await supabase
    .from("flashcard_items")
    .select("id", { count: "exact", head: true })
    .eq("flashcard_id", deckId);
  await supabase
    .from("flashcards")
    .update({ card_count: count ?? 0, updated_at: new Date().toISOString() })
    .eq("id", deckId);
}

export const createCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        deckId: z.string().uuid(),
        prompt: z.string().min(1).max(2000),
        answer: z.string().min(1).max(4000),
        hint: z.string().max(500).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("flashcard_items")
      .insert({
        flashcard_id: data.deckId,
        prompt: data.prompt,
        answer: data.answer,
        hint: data.hint ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await syncDeckCounts(context.supabase as never, data.deckId);
    return row as Card;
  });

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), deckId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("flashcard_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await syncDeckCounts(context.supabase as never, data.deckId);
    return { ok: true };
  });

/** Spaced-repetition review: records a rating and updates deck mastery. */
export const reviewCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        deckId: z.string().uuid(),
        rating: z.enum(["again", "hard", "good", "easy"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: card } = await context.supabase
      .from("flashcard_items")
      .select("review_count")
      .eq("id", data.id)
      .single();
    const difficulty =
      data.rating === "again" ? "hard" : data.rating === "easy" ? "easy" : data.rating === "hard" ? "hard" : "medium";
    await context.supabase
      .from("flashcard_items")
      .update({
        review_count: (card?.review_count ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        difficulty,
      })
      .eq("id", data.id);

    const gain = { again: -4, hard: 2, good: 5, easy: 8 }[data.rating];
    const { data: deck } = await context.supabase
      .from("flashcards")
      .select("mastery_score,due_today")
      .eq("id", data.deckId)
      .single();
    const mastery = Math.max(0, Math.min(100, Number(deck?.mastery_score ?? 0) + gain));
    const due = Math.max(0, (deck?.due_today ?? 0) - (data.rating === "again" ? 0 : 1));
    await context.supabase
      .from("flashcards")
      .update({ mastery_score: mastery, due_today: due, updated_at: new Date().toISOString() })
      .eq("id", data.deckId);

    await context.supabase.from("gamification_events").insert({
      user_id: context.userId,
      event_type: "flashcard_review",
      xp_delta: data.rating === "again" ? 1 : 3,
      metadata: { deck_id: data.deckId, rating: data.rating },
    });

    return { mastery, due };
  });

/** AI-generates a deck from a topic prompt. */
export const generateDeckFromTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        topic: z.string().min(2).max(200),
        category: z.string().max(80).default("General"),
        count: z.number().int().min(4).max(20).default(10),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { aiJson } = await import("./ai-generate.server");
    const cards = await aiJson<{ prompt: string; answer: string; hint?: string }[]>(
      "You create high-quality study flashcards.",
      `Create ${data.count} flashcards about "${data.topic}". JSON array of objects with keys "prompt", "answer", "hint".`,
    );
    const { data: deck, error } = await context.supabase
      .from("flashcards")
      .insert({
        owner_id: context.userId,
        title: data.topic,
        category: data.category,
        source: "ai",
        deck_type: "ai",
        card_count: cards.length,
        due_today: cards.length,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { error: e2 } = await context.supabase.from("flashcard_items").insert(
      cards.map((c) => ({
        flashcard_id: deck.id,
        prompt: c.prompt,
        answer: c.answer,
        hint: c.hint ?? null,
      })),
    );
    if (e2) throw new Error(e2.message);
    return deck as Deck;
  });