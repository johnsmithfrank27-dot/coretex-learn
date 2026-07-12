import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { FileText, Video, Link2, Book, Download } from "lucide-react";

export const Route = createFileRoute("/app/resources")({ component: Resources });

const items = [
  { t: "Algebra Cheatsheet", type: "PDF", i: FileText },
  { t: "Photosynthesis explained", type: "Video · 12 min", i: Video },
  { t: "Khan Academy: Newton's Laws", type: "External link", i: Link2 },
  { t: "Chemistry: The Central Science", type: "eBook", i: Book },
  { t: "Past Papers 2024", type: "ZIP", i: Download },
  { t: "Interactive Periodic Table", type: "Web app", i: Link2 },
];

function Resources() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Resources" subtitle="Everything you need. Curated for you." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(r => { const I = r.i; return (
          <div key={r.t} className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition cursor-pointer">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-soft text-primary"><I className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{r.t}</div>
              <div className="text-xs text-muted-foreground">{r.type}</div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}