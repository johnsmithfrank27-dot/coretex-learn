import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/learn")({
  head: () => ({ meta: [{ title: "Learn — Coretex" }, { name: "description", content: "Structured lessons and paths." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Learn" subtitle="Structured lessons and paths." />
      <EmptyState icon={BookOpen} title="No active learning path" description="Pick a subject from your profile or ask the AI Tutor to build one for you." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
