import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateStructured } from "@/lib/ai-json.server";

export type Resource = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string;
  resource_type: string;
  url: string | null;
  subject: string;
  is_bookmarked: boolean;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

const ResourceInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(40).default("link"),
  resource_type: z.string().max(40).default("link"),
  url: z.string().max(2000).nullable().optional(),
  subject: z.string().max(80).default("General"),
  is_bookmarked: z.boolean().optional(),
});

export const listResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Resource[];
  });

export const createResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ResourceInput.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("resources")
      .insert({ ...data, owner_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Resource;
  });

export const updateResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), patch: ResourceInput.partial() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("resources")
      .update(data.patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Resource;
  });

export const deleteResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const summarizeResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: r, error } = await context.supabase
      .from("resources")
      .select("title,description,url,subject")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const out = await generateStructured({
      schema: z.object({ text: z.string() }),
      system: "You are Coretex, an expert study coach. Return a short markdown study briefing.",
      prompt: `Summarize what a student should learn from this resource and how to study it.\nTitle: ${r.title}\nSubject: ${r.subject}\nDescription: ${r.description ?? "n/a"}\nURL: ${r.url ?? "n/a"}`,
    });
    await context.supabase.from("resources").update({ ai_summary: out.text }).eq("id", data.id);
    return { text: out.text };
  });