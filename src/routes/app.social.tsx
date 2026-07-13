import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/social")({
  head: () => ({ meta: [{ title: "Social — Coretex" }, { name: "description", content: "Learn out loud. Share posts, ask questions, teach others." }] }),
  component: Social,
});

function Social() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Social Learning" subtitle="Learn out loud. Share, ask, teach." />
      <EmptyState
        icon={Users}
        title="No posts in your feed yet"
        description="Follow classmates, join study groups, or share your first note to see posts here."
        actionLabel="Explore study groups"
        actionTo="/app/study-groups"
      />
    </div>
  );
}