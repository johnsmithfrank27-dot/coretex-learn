import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/app/leaderboards")({
  head: () => ({ meta: [{ title: "Leaderboards — Coretex" }, { name: "description", content: "See how you stack up against other learners." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Leaderboards" subtitle="See how you stack up against other learners." />
      <EmptyState icon={Trophy} title="No rankings yet" description="Complete quizzes and lessons to earn XP and climb the board." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
