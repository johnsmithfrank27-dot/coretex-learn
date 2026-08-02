import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/app/flashcards")({
  head: () => ({ meta: [{ title: "Flashcards — Coretex" }, { name: "description", content: "Practice with spaced repetition." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Flashcards" subtitle="Practice with spaced repetition." />
      <EmptyState icon={Layers} title="No flashcard decks yet" description="Create a deck or generate one from a topic using the AI Tutor." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
