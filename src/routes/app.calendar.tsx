import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Calendar as CalIcon } from "lucide-react";

export const Route = createFileRoute("/app/calendar")({ component: CalendarPage });

const events = [
  { d: 12, t: "Math Assignment", time: "14:00", color: "bg-primary" },
  { d: 15, t: "Chemistry Quiz", time: "10:00", color: "bg-warning" },
  { d: 18, t: "Study Group", time: "19:00", color: "bg-info" },
  { d: 22, t: "Physics Exam", time: "09:00", color: "bg-destructive" },
];

function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Calendar" subtitle="Every deadline. Every session. In one place." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">November 2026</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const inMonth = d > 0 && d <= 30;
              const ev = events.find(e => e.d === d);
              return (
                <div key={i} className={`aspect-square rounded-xl p-2 text-xs ${inMonth ? "bg-secondary/40 hover:bg-accent transition cursor-pointer" : "opacity-30"}`}>
                  <div className="font-semibold">{inMonth ? d : ""}</div>
                  {ev && <div className={`mt-1 h-1 w-full rounded-full ${ev.color}`} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-center gap-2 font-bold"><CalIcon className="h-4 w-4 text-primary" />Upcoming</div>
          {events.map(e => (
            <div key={e.t} className="rounded-2xl bg-secondary/50 p-3">
              <div className={`inline-block h-1.5 w-8 rounded-full ${e.color} mb-2`} />
              <div className="text-sm font-semibold">{e.t}</div>
              <div className="text-xs text-muted-foreground">Nov {e.d} · {e.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}