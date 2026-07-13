import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Coretex" }, { name: "description", content: "Plan your study schedule." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Calendar" subtitle="Plan your study schedule." />
      <EmptyState icon={Calendar} title="No events yet" description="Add exams, deadlines, and study sessions to see them here." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
