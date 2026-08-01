import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

export async function aiText(system: string, prompt: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const groq = createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    headers: { Authorization: `Bearer ${key}` },
  });
  const { text } = await generateText({
    model: groq("qwen/qwen3.6-27b"),
    system,
    prompt,
    temperature: 0.5,
  });
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function aiJson<T>(system: string, prompt: string): Promise<T> {
  const raw = await aiText(
    system + "\n\nRespond with valid JSON only. No markdown fences, no commentary.",
    prompt,
  );
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}