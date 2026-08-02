import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateStructured } from "@/lib/ai-json.server";

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
  is_archived: boolean;
  visibility: string;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

const NoteInput = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(100000).default(""),
  folder: z.string().max(80).default("General"),
  tags: z.array(z.string().max(40)).max(20).default([]),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  visibility: z.string().max(20).optional(),
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
  .inputValidator((i: unknown) => NoteInput.parse(i))
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
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), patch: NoteInput.partial() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .update(data.patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Note;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: src, error } = await context.supabase.from("notes").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const n = src as Note;
    const { data: row, error: insErr } = await context.supabase
      .from("notes")
      .insert({
        owner_id: context.userId,
        title: `${n.title} (copy)`,
        content: n.content,
        folder: n.folder,
        tags: n.tags,
      })
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);
    return row as Note;
  });

/** AI actions on a note: summarize, rewrite, explain, expand, study guide. */
export const runNoteAiAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["summarize", "rewrite", "explain", "expand", "study_guide", "mind_map"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: note, error } = await context.supabase
      .from("notes")
      .select("title,content")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const instructions: Record<string, string> = {
      summarize: "Write a concise 4-6 bullet summary of the key ideas.",
      rewrite: "Rewrite the note so it is clearer and better structured, keeping all facts.",
      explain: "Explain the note simply, like a patient teacher, using an analogy and a worked example.",
      expand: "Expand the note with extra detail, examples and context a student would need.",
      study_guide: "Turn the note into a study guide with headings, key terms, and 3 practice questions.",
      mind_map: "Produce an indented text mind map of the note's concepts and their relationships.",
    };

    const result = await generateStructured({
      schema: z.object({ text: z.string() }),
      system: "You are Coretex, an expert, encouraging teacher. Return well-structured markdown.",
      prompt: `${instructions[data.action]}\n\nNote title: ${note.title}\n\nNote content:\n${note.content}`,
    });

    if (data.action === "summarize") {
      await context.supabase.from("notes").update({ ai_summary: result.text }).eq("id", data.id);
    }
    return { text: result.text };
  });