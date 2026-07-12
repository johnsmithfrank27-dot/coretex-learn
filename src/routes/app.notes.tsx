import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Sparkles, Layers, HelpCircle, Bookmark, Download, Plus } from "lucide-react";

export const Route = createFileRoute("/app/notes")({ component: Notes });

const notes = [
  { title: "Cell Structure & Function", subject: "Biology", body: "Prokaryotes lack a nucleus while eukaryotes have membrane-bound organelles including mitochondria, the powerhouse of the cell…", color: "from-emerald-100 to-teal-50" },
  { title: "Quadratic Equations", subject: "Mathematics", body: "The quadratic formula x = (−b ± √(b²−4ac)) / 2a solves any equation of the form ax² + bx + c = 0.", color: "from-purple-100 to-fuchsia-50" },
  { title: "Newton's Laws of Motion", subject: "Physics", body: "1. An object in motion stays in motion. 2. F = ma. 3. For every action, an equal and opposite reaction.", color: "from-blue-100 to-indigo-50" },
  { title: "Organic Functional Groups", subject: "Chemistry", body: "Alcohols (−OH), aldehydes (−CHO), ketones (C=O), carboxylic acids (−COOH)…", color: "from-amber-100 to-orange-50" },
  { title: "Photosynthesis Overview", subject: "Biology", body: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Occurs in chloroplasts using chlorophyll to absorb light energy.", color: "from-lime-100 to-green-50" },
  { title: "Trigonometry Identities", subject: "Mathematics", body: "sin²θ + cos²θ = 1. tan θ = sin θ / cos θ. Double-angle: sin 2θ = 2 sin θ cos θ.", color: "from-pink-100 to-rose-50" },
];

function Notes() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Notes" subtitle="Your knowledge base, beautifully organized.">
        <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"><Plus className="h-4 w-4" /> New Note</button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {notes.map(n => (
          <div key={n.title} className={`rounded-3xl border border-border bg-gradient-to-br ${n.color} p-5 shadow-soft hover:shadow-elegant transition cursor-pointer`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{n.subject}</div>
            <h3 className="mt-1 text-lg font-bold">{n.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm text-foreground/70">{n.body}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              <ActionChip icon={Sparkles}>AI Summary</ActionChip>
              <ActionChip icon={Layers}>Flashcards</ActionChip>
              <ActionChip icon={HelpCircle}>Quiz</ActionChip>
              <ActionChip icon={Bookmark}>Save</ActionChip>
              <ActionChip icon={Download}>Export</ActionChip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionChip({ icon: I, children }: { icon: any; children: React.ReactNode }) {
  return <button className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-foreground/80 backdrop-blur hover:bg-white transition"><I className="h-3 w-3 text-primary" />{children}</button>;
}