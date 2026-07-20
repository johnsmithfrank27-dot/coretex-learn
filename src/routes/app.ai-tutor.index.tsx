import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { newThreadId, loadThreads } from "@/lib/chat-threads";

export const Route = createFileRoute("/app/ai-tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — Coretex" }, { name: "description", content: "Chat with Coretex AI. Every conversation is saved on this device." }] }),
  component: AiTutorIndex,
});

function AiTutorIndex() {
  const nav = useNavigate();
  useEffect(() => {
    const threads = loadThreads();
    const id = threads[0]?.id ?? newThreadId();
    nav({ to: "/app/ai-tutor/$threadId", params: { threadId: id }, replace: true });
  }, [nav]);
  return null;
}