import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return new Response("Missing GROQ_API_KEY", { status: 500 });

        const { messages } = (await request.json()) as {
          messages: { role: "user" | "assistant" | "system"; content: string }[];
        };

        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen3-32b",
            messages: [
              {
                role: "system",
                content:
                  "You are Coretex AI, a friendly, encouraging tutor. Explain clearly with concise structure, examples, and follow-up questions. Use markdown when helpful.",
              },
              ...messages,
            ],
            temperature: 0.6,
            max_completion_tokens: 4096,
            top_p: 0.95,
            reasoning_effort: "default",
            stream: true,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text();
          return new Response(text || "Upstream error", { status: upstream.status });
        }

        // Parse SSE from Groq and emit plain text chunks (stripping <think> blocks).
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buf = "";
        let inThink = false;

        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() ?? "";
                for (const raw of lines) {
                  const line = raw.trim();
                  if (!line.startsWith("data:")) continue;
                  const data = line.slice(5).trim();
                  if (data === "[DONE]") { controller.close(); return; }
                  try {
                    const json = JSON.parse(data);
                    let delta: string = json.choices?.[0]?.delta?.content ?? "";
                    if (!delta) continue;
                    // Strip <think>...</think> reasoning
                    let out = "";
                    let i = 0;
                    while (i < delta.length) {
                      if (!inThink) {
                        const idx = delta.indexOf("<think>", i);
                        if (idx === -1) { out += delta.slice(i); break; }
                        out += delta.slice(i, idx);
                        i = idx + 7;
                        inThink = true;
                      } else {
                        const idx = delta.indexOf("</think>", i);
                        if (idx === -1) { i = delta.length; break; }
                        i = idx + 8;
                        inThink = false;
                      }
                    }
                    if (out) controller.enqueue(encoder.encode(out));
                  } catch { /* ignore parse errors on keepalive lines */ }
                }
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});