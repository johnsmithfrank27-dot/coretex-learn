import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/progress")({
  head: () => ({ meta: [{ title: "Progress — Coretex" }, { name: "description", content: "Track your learning journey." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Progress" subtitle="Track your learning journey." />
      <EmptyState icon={TrendingUp} title="No progress data yet" description="Study, take quizzes and complete lessons to see stats here." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
