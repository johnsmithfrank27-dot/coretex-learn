import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Users, Mic, FileText, Trophy, Plus } from "lucide-react";
import math from "@/assets/subject-math.jpg";
import bio from "@/assets/subject-biology.jpg";
import phy from "@/assets/subject-physics.jpg";
import chem from "@/assets/subject-chemistry.jpg";

export const Route = createFileRoute("/app/study-groups")({ component: Groups });

const groups = [
  { name: "AS Mathematics Group", subject: "Mathematics", members: 12, active: 8, img: math },
  { name: "Biology Buddies", subject: "Biology", members: 8, active: 3, img: bio },
  { name: "Physics Champions", subject: "Physics", members: 15, active: 11, img: phy },
  { name: "Chem Wizards", subject: "Chemistry", members: 10, active: 5, img: chem },
];

function Groups() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Study Groups" subtitle="Learn together. Grow together.">
        <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"><Plus className="h-4 w-4" /> New Group</button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {groups.map(g => (
          <div key={g.name} className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition">
            <img src={g.img} alt={g.name} className="aspect-[16/7] w-full object-cover" loading="lazy" />
            <div className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">{g.subject}</div>
              <h3 className="mt-1 text-lg font-bold">{g.name}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.members} members</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> {g.active} active</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-semibold">
                <div className="rounded-lg bg-secondary/60 py-2 text-center"><Mic className="mx-auto mb-0.5 h-3.5 w-3.5 text-primary" />Voice</div>
                <div className="rounded-lg bg-secondary/60 py-2 text-center"><FileText className="mx-auto mb-0.5 h-3.5 w-3.5 text-primary" />Notes</div>
                <div className="rounded-lg bg-secondary/60 py-2 text-center"><Trophy className="mx-auto mb-0.5 h-3.5 w-3.5 text-primary" />Board</div>
              </div>
              <button className="mt-4 w-full rounded-xl bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-elegant transition">Join Group</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}