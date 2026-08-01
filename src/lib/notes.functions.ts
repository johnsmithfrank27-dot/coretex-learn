import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Note = {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  is_shared: boolean;
  visibility: string;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

const NoteInput = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).default(""),
  folder: z.string().max(80).default("General"),
  tags: z.array(z.string().max(40)).max(20).default([]),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
});

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Note[];
  });

export const createNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => NoteInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .insert({ ...data, owner_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Note;
  });

export const updateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: NoteInput.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Note;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: src, error } = await context.supabase
      .from("notes")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { data: row, error: e2 } = await context.supabase
      .from("notes")
      .insert({
        owner_id: context.userId,
        title: `${src.title} (copy)`,
        content: src.content,
        folder: src.folder,
        tags: src.tags,
      })
      .select("*")
      .single();
    if (e2) throw new Error(e2.message);
    return row as Note;
  });

/** AI actions on a note: summarize / rewrite / explain / study-guide. */
export const runNoteAiAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["summarize", "rewrite", "explain", "study_guide"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: note, error } = await context.supabase
      .from("notes")
      .select("title,content")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { aiText } = await import("./ai-generate.server");
    const instructions: Record<string, string> = {
      summarize: "Summarize the student's note into 5-8 crisp bullet points of the key ideas.",
      rewrite: "Rewrite the note so it is clearer and better structured, keeping all facts. Use headings and short paragraphs.",
      explain: "Explain the note's concepts like a patient teacher: simple language, a real-life analogy, one worked example, and common mistakes.",
      study_guide: "Turn the note into a compact study guide: key terms, core concepts, formulas, and 3 practice questions.",
    };
    const out = await aiText(
      "You are Coretex, a world-class, encouraging tutor. Use clean markdown, short sections, no filler.",
      `${instructions[data.action]}\n\nNote title: ${note.title}\n\nNote content:\n${note.content}`,
    );
    if (data.action === "summarize") {
      await context.supabase.from("notes").update({ ai_summary: out }).eq("id", data.id);
    }
    return { output: out };
  });

/** Generates a flashcard deck from a note and stores it in Flashcards. */
export const generateFlashcardsFromNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: note, error } = await context.supabase
      .from("notes")
      .select("title,content,folder")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { aiJson } = await import("./ai-generate.server");
    const cards = await aiJson<{ prompt: string; answer: string; hint?: string }[]>(
      "You create high-quality study flashcards.",
      `Create 8-12 flashcards from this note. JSON array of objects with keys "prompt", "answer", "hint".\n\nTitle: ${note.title}\n\n${note.content}`,
    );
    const { data: deck, error: e2 } = await context.supabase
      .from("flashcards")
      .insert({
        owner_id: context.userId,
        title: note.title,
        category: note.folder ?? "General",
        source: "note",
        deck_type: "ai",
        card_count: cards.length,
        due_today: cards.length,
      })
      .select("*")
      .single();
    if (e2) throw new Error(e2.message);
    const { error: e3 } = await context.supabase.from("flashcard_items").insert(
      cards.map((c) => ({
        flashcard_id: deck.id,
        prompt: c.prompt,
        answer: c.answer,
        hint: c.hint ?? null,
      })),
    );
    if (e3) throw new Error(e3.message);
    return { deckId: deck.id as string, count: cards.length };
  });