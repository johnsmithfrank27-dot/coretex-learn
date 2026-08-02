import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StickyNote } from "lucide-react";

export const Route = createFileRoute("/app/notes")({
  head: () => ({ meta: [{ title: "Notes — Coretex" }, { name: "description", content: "Your smart notebooks." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Notes" subtitle="Your smart notebooks." />
      <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to start building your knowledge base." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
