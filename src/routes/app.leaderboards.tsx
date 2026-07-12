import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/app/leaderboards")({ component: LB });

const top = [
  { n: "Ama Serwaa", xp: 5420, streak: 28 },
  { n: "Frank Osafo", xp: 4230, streak: 12 },
  { n: "Kofi Mensah", xp: 3980, streak: 19 },
];
const rest = Array.from({ length: 12 }, (_, i) => ({ n: `Student ${i + 4}`, xp: 3800 - i * 120, streak: 15 - i }));

function LB() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Leaderboards" subtitle="Compete. Celebrate. Climb." />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[top[1], top[0], top[2]].map((s, i) => {
          const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const isFirst = rank === 1;
          return (
            <div key={s.n} className={`rounded-3xl border border-border p-6 text-center shadow-soft ${isFirst ? "bg-gradient-hero text-primary-foreground shadow-elegant scale-105" : "bg-card"}`}>
              <Trophy className={`mx-auto h-8 w-8 ${isFirst ? "text-warning" : "text-primary"}`} />
              <div className={`mt-2 text-3xl font-extrabold ${isFirst ? "" : "text-primary"}`}>#{rank}</div>
              <div className={`mx-auto mt-4 grid h-16 w-16 place-items-center rounded-full ${isFirst ? "bg-white/20" : "bg-gradient-primary text-primary-foreground"} font-extrabold text-xl`}>{s.n[0]}</div>
              <div className="mt-3 font-bold">{s.n}</div>
              <div className={`mt-1 text-sm ${isFirst ? "opacity-90" : "text-muted-foreground"}`}>{s.xp.toLocaleString()} XP</div>
            </div>
          );
        })}
      </div>
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
        {rest.map((s, i) => (
          <div key={s.n} className="flex items-center gap-4 border-b last:border-0 border-border/60 px-6 py-4">
            <div className="w-8 text-sm font-bold text-muted-foreground">#{i + 4}</div>
            <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold">{s.n[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{s.n}</div>
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{s.streak} day streak</div>
            </div>
            <div className="text-sm font-bold">{s.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}