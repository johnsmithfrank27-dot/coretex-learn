import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { UsersRound } from "lucide-react";

export const Route = createFileRoute("/app/study-groups")({
  head: () => ({ meta: [{ title: "Study Groups — Coretex" }, { name: "description", content: "Learn with others." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Study Groups" subtitle="Learn with others." />
      <EmptyState icon={UsersRound} title="You have not joined any groups yet" description="Create a group or ask the AI Tutor to suggest one for your subjects." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
