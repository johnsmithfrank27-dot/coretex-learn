import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TrendingUp, Zap, Trophy, Target, Flame } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/progress")({ component: Progress });

const week = [
  { d: "Mon", h: 2 }, { d: "Tue", h: 3.5 }, { d: "Wed", h: 2.5 }, { d: "Thu", h: 4 },
  { d: "Fri", h: 3 }, { d: "Sat", h: 5 }, { d: "Sun", h: 4.5 },
];
const subjects = [
  { name: "Mathematics", v: 40, c: "#6D28D9" },
  { name: "Physics", v: 25, c: "#8B5CF6" },
  { name: "Biology", v: 20, c: "#A78BFA" },
  { name: "Chemistry", v: 15, c: "#F59E0B" },
];
const monthly = [
  { m: "Jan", s: 65 }, { m: "Feb", s: 70 }, { m: "Mar", s: 75 }, { m: "Apr", s: 78 },
  { m: "May", s: 82 }, { m: "Jun", s: 88 },
];

function Progress() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Progress" subtitle="Your learning story, in beautiful detail." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Study Time" value="12h 45m" delta="+15%" icon={TrendingUp} />
        <Kpi label="XP Gained" value="1,250" delta="+30%" icon={Zap} />
        <Kpi label="Accuracy" value="87%" delta="+8%" icon={Target} />
        <Kpi label="Streak" value="12 days" delta="Best!" icon={Flame} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-bold mb-4">Study Time (this week)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={week}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 290)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.03 280)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 280)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.015 290)" }} />
                <Line type="monotone" dataKey="h" stroke="#6D28D9" strokeWidth={3} dot={{ r: 5, fill: "#6D28D9" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-bold mb-4">Subject Mastery</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={subjects} dataKey="v" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {subjects.map(s => <Cell key={s.name} fill={s.c} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {subjects.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.c }} />{s.name}</span>
                <span className="font-semibold">{s.v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-bold mb-4">Monthly Performance</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 290)" />
              <XAxis dataKey="m" stroke="oklch(0.5 0.03 280)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.03 280)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.015 290)" }} />
              <Bar dataKey="s" fill="url(#bg)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-gradient-soft p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4"><Trophy className="h-5 w-5 text-primary" /><h3 className="font-bold">Achievements</h3></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["First Streak", "10 Quizzes", "Bio Master", "100 XP Day"].map((a, i) => (
            <div key={a} className="rounded-2xl bg-white/70 p-4 text-center backdrop-blur">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-lg">🏆</div>
              <div className="mt-2 text-xs font-bold">{a}</div>
              <div className="text-[10px] text-muted-foreground">Unlocked</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon: I }: { label: string; value: string; delta: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><I className="h-4 w-4 text-primary" /></div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-[11px] font-semibold text-success">{delta}</div>
    </div>
  );
}