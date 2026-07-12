import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Play, Clock, Star } from "lucide-react";
import math from "@/assets/subject-math.jpg";
import bio from "@/assets/subject-biology.jpg";
import phy from "@/assets/subject-physics.jpg";
import chem from "@/assets/subject-chemistry.jpg";

export const Route = createFileRoute("/app/learn")({ component: Learn });

const courses = [
  { t: "Algebra Foundations", s: "Mathematics", img: math, l: "Beginner", h: "12h", r: 4.9 },
  { t: "Cellular Biology", s: "Biology", img: bio, l: "Intermediate", h: "8h", r: 4.8 },
  { t: "Classical Mechanics", s: "Physics", img: phy, l: "Advanced", h: "16h", r: 4.9 },
  { t: "Organic Chemistry", s: "Chemistry", img: chem, l: "Intermediate", h: "10h", r: 4.7 },
  { t: "Calculus I", s: "Mathematics", img: math, l: "Intermediate", h: "14h", r: 4.9 },
  { t: "Genetics 101", s: "Biology", img: bio, l: "Beginner", h: "6h", r: 4.6 },
];

function Learn() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Learn" subtitle="Curated courses, taught with clarity." />
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", "Mathematics", "Biology", "Physics", "Chemistry", "Languages"].map((c, i) => (
          <button key={c} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${i===0 ? "bg-gradient-primary text-primary-foreground shadow-soft" : "border border-border bg-secondary/60 hover:bg-accent"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((c) => (
          <div key={c.t} className="group rounded-3xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition cursor-pointer">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={c.img} alt={c.t} className="h-full w-full object-cover group-hover:scale-105 transition-transform" width={640} height={360} loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-primary shadow-elegant"><Play className="h-4 w-4 fill-current" /></button>
              <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary">{c.l}</span>
            </div>
            <div className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">{c.s}</div>
              <h3 className="mt-1 text-lg font-bold">{c.t}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.h}</span>
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {c.r}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}