import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

/**
 * Generates a personalized weekly timetable for the signed-in user, based on
 * their profile subjects, education level and goals. Only runs when the user
 * has zero calendar events yet, so it never overwrites existing plans.
 */
export const ensurePersonalTimetable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Skip if the user already has any events.
    const { count } = await supabase
      .from("calendar_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) > 0) return { created: 0, skipped: true as const };

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name,education_level,subjects,goals")
      .eq("id", userId)
      .maybeSingle();

    const subjects: string[] = (profile?.subjects ?? []) as string[];
    if (subjects.length === 0) return { created: 0, skipped: true as const };

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { created: 0, skipped: true as const };

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    // Anchor the plan to the next Monday in the user's timezone-agnostic UTC baseline.
    const now = new Date();
    const dayIdx = now.getUTCDay(); // 0 Sun ... 6 Sat
    const daysUntilMonday = ((8 - dayIdx) % 7) || 7;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    monday.setUTCHours(0, 0, 0, 0);
    const weekStartISO = monday.toISOString().slice(0, 10);

    const schema = z.object({
      events: z.array(
        z.object({
          title: z.string(),
          subject: z.string(),
          day_offset: z.number().int().min(0).max(6),
          start_time: z.string().describe("HH:MM 24-hour, e.g. 16:00"),
          duration_minutes: z.number().int().min(20).max(120),
          description: z.string(),
        }),
      ),
    });

    let plan: z.infer<typeof schema> | null = null;
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema }),
        prompt:
`Design a balanced, realistic weekly study timetable for a student.

Student:
- Name: ${profile?.display_name ?? "student"}
- Level: ${profile?.education_level ?? "unspecified"}
- Subjects: ${subjects.join(", ")}
- Goals: ${((profile?.goals ?? []) as string[]).join(", ") || "general improvement"}

Rules:
- Create 8 to 12 focused study sessions spread Mon–Sun (day_offset 0 = Monday, 6 = Sunday).
- Rotate through every subject fairly; weight harder/exam-relevant ones slightly more.
- 25–60 minutes per session. Prefer late afternoon / early evening (15:00–20:00). Lighter weekends.
- Each session's title should be specific ("Physics — Kinematics practice"), not generic ("Study").
- Description: 1 short sentence on what to actually do.`,
      });
      plan = output;
    } catch {
      plan = null;
    }

    if (!plan || plan.events.length === 0) return { created: 0, skipped: true as const };

    const rows = plan.events.map((e) => {
      const [hh, mm] = e.start_time.split(":").map((x) => parseInt(x, 10));
      const start = new Date(`${weekStartISO}T00:00:00.000Z`);
      start.setUTCDate(start.getUTCDate() + e.day_offset);
      start.setUTCHours(isFinite(hh) ? hh : 17, isFinite(mm) ? mm : 0, 0, 0);
      const end = new Date(start.getTime() + e.duration_minutes * 60_000);
      return {
        user_id: userId,
        title: e.title,
        description: e.description,
        category: "study",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
      };
    });

    const { error } = await supabase.from("calendar_events").insert(rows);
    if (error) return { created: 0, skipped: true as const, error: error.message };
    return { created: rows.length, skipped: false as const };
  });