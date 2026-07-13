import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Library } from "lucide-react";

export const Route = createFileRoute("/app/resources")({
  head: () => ({ meta: [{ title: "Resources — Coretex" }, { name: "description", content: "Save links, PDFs and references." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Resources" subtitle="Save links, PDFs and references." />
      <EmptyState icon={Library} title="No saved resources" description="Save your first link or file to build your personal library." actionLabel="Ask the AI Tutor" actionTo="/app/ai-tutor" />
    </div>
  );
}
