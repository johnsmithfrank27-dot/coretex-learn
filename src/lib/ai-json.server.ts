import { generateText, Output } from "ai";
import type { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

/**
 * Shared structured-output helper. Prefers Groq (the app's tutor model) and
 * falls back to the Lovable AI gateway so features keep working either way.
 */
export async function generateStructured<T>(opts: {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
}): Promise<T> {
  const groqKey = process.env.GROQ_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  const model = groqKey
    ? createOpenAICompatible({
        name: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        headers: { Authorization: `Bearer ${groqKey}` },
      })("qwen/qwen3.6-27b")
    : lovableKey
      ? createLovableAiGatewayProvider(lovableKey)("google/gemini-3-flash-preview")
      : null;

  if (!model) throw new Error("AI is not configured for this project yet.");

  const { experimental_output } = await generateText({
    model,
    system: opts.system,
    prompt: opts.prompt,
    experimental_output: Output.object({ schema: opts.schema }),
  });
  return experimental_output as T;
}