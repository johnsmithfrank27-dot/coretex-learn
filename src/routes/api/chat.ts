import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

function createUserSupabase(token: string) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if ((key.startsWith("sb_") || false) && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const supa = token ? createUserSupabase(token) : null;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const tools = supa
          ? {
              listCalendarEvents: tool({
                description: "List the current user's upcoming calendar events (study sessions, exams, deadlines).",
                inputSchema: z.object({ limit: z.number().int().min(1).max(50).optional() }),
                execute: async ({ limit }) => {
                  const { data, error } = await supa
                    .from("calendar_events")
                    .select("id,title,description,category,starts_at,ends_at,location")
                    .gte("starts_at", new Date(Date.now() - 86_400_000).toISOString())
                    .order("starts_at", { ascending: true })
                    .limit(limit ?? 20);
                  if (error) return { error: error.message };
                  return { events: data ?? [] };
                },
              }),
              createCalendarEvent: tool({
                description: "Create a new calendar event for the user. Use ISO 8601 datetimes.",
                inputSchema: z.object({
                  title: z.string(),
                  starts_at: z.string().describe("ISO 8601 datetime, e.g. 2026-07-20T14:00:00Z"),
                  ends_at: z.string().optional(),
                  category: z.enum(["study", "exam", "deadline", "class", "other"]).optional(),
                  description: z.string().optional(),
                  location: z.string().optional(),
                }),
                execute: async (input) => {
                  const { data: { user } } = await supa.auth.getUser(token);
                  if (!user) return { error: "Not authenticated" };
                  const { data, error } = await supa
                    .from("calendar_events")
                    .insert({
                      user_id: user.id,
                      title: input.title,
                      starts_at: input.starts_at,
                      ends_at: input.ends_at ?? null,
                      category: input.category ?? "study",
                      description: input.description ?? null,
                      location: input.location ?? null,
                    })
                    .select("id,title,starts_at")
                    .single();
                  if (error) return { error: error.message };
                  return { created: data };
                },
              }),
              deleteCalendarEvent: tool({
                description: "Delete a calendar event by id. Confirm intent with the user before calling.",
                inputSchema: z.object({ id: z.string().uuid() }),
                execute: async ({ id }) => {
                  const { error } = await supa.from("calendar_events").delete().eq("id", id);
                  if (error) return { error: error.message };
                  return { deleted: id };
                },
              }),
              getProfile: tool({
                description: "Get the current user's profile (name, subjects, goals, XP, streak).",
                inputSchema: z.object({}),
                execute: async () => {
                  const { data: { user } } = await supa.auth.getUser(token);
                  if (!user) return { error: "Not authenticated" };
                  const { data, error } = await supa.from("profiles").select("*").eq("id", user.id).maybeSingle();
                  if (error) return { error: error.message };
                  return { profile: data };
                },
              }),
              updateProfile: tool({
                description: "Update the current user's profile fields (display_name, school, education_level, subjects, goals).",
                inputSchema: z.object({
                  display_name: z.string().optional(),
                  school: z.string().optional(),
                  education_level: z.string().optional(),
                  subjects: z.array(z.string()).optional(),
                  goals: z.array(z.string()).optional(),
                }),
                execute: async (patch) => {
                  const { data: { user } } = await supa.auth.getUser(token);
                  if (!user) return { error: "Not authenticated" };
                  const { data, error } = await supa.from("profiles").update(patch).eq("id", user.id).select("*").single();
                  if (error) return { error: error.message };
                  return { profile: data };
                },
              }),
            }
          : undefined;

        const result = streamText({
          model,
          system:
            "You are Coretex AI, a friendly, encouraging tutor and personal assistant inside the Coretex learning app. " +
            "You can help users learn AND take actions in their app on their behalf using the provided tools. " +
            "Use tools when the user wants to plan a study session, add an exam, view/change their schedule, or update their profile. " +
            "When creating events, always resolve relative dates ('tomorrow', 'next Monday') to concrete ISO datetimes in the user's local time based on the current date. " +
            `Current date/time: ${new Date().toISOString()}. ` +
            "Explain clearly with concise structure, examples, and follow-up questions. Use markdown when helpful.",
          messages: convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(8),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});