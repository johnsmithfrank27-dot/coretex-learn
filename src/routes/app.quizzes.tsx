import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/app/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — Coretex" }, { name: "description", content: "Test what you know." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Quizzes" subtitle="Test what you know." />
      <EmptyState icon={HelpCircle} title="No quizzes yet" description="Generate a quiz on any topic in seconds with the AI Tutor." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
