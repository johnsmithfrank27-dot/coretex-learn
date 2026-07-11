import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles, Flame, CheckCircle2, ChevronRight, Calendar, Users, Layers, HelpCircle,
  TrendingUp, Send, BookOpen, Trophy, Bookmark, Zap, Brain, MessageCircle,
} from "lucide-react";
import aiMascot from "@/assets/ai-mascot.png";
import mountains from "@/assets/streak-mountains.jpg";
import subjMath from "@/assets/subject-math.jpg";
import subjBio from "@/assets/subject-biology.jpg";
import subjPhy from "@/assets/subject-physics.jpg";
import subjChem from "@/assets/subject-chemistry.jpg";
import avatarFrank from "@/assets/avatar-frank.jpg";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

const subjects = [
  { name: "Mathematics", topic: "Algebra Basics", pct: 65, img: subjMath, color: "bg-primary" },
  { name: "Biology", topic: "Cell Structure", pct: 40, img: subjBio, color: "bg-warning" },
  { name: "Physics", topic: "Newton's Laws", pct: 20, img: subjPhy, color: "bg-info" },
  { name: "Chemistry", topic: "Organic Compounds", pct: 30, img: subjChem, color: "bg-primary" },
];

function HomePage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Good morning, Frank! <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Ready to make today amazing?</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground border border-border hover:bg-accent transition">
          <Sparkles className="h-4 w-4" /> Customize
        </button>
      </div>

      {/* Row 1: AI Tutor / Daily Goal / Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-5">
        {/* AI Tutor */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-soft p-6 shadow-soft">
          <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">AI Tutor</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow-soft">
                <Sparkles className="h-3 w-3" /> Powered by Coretex AI
              </span>
              <p className="mt-4 max-w-xs text-sm text-foreground/80 leading-relaxed">
                Hi Frank! I'm here to help you learn, understand and achieve more every day.
              </p>
              <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
                <MessageCircle className="h-4 w-4" /> Chat with AI Tutor
              </button>
            </div>
            <img src={aiMascot} alt="AI Tutor" className="h-44 w-44 shrink-0 object-contain drop-shadow-xl" width={200} height={200} />
          </div>
        </div>

        {/* Daily Goal */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="text-base font-bold">Daily Goal</div>
          <div className="mt-4 flex flex-col items-center">
            <ProgressRing value={75} />
            <div className="mt-3 text-xs text-muted-foreground">3 / 4 Tasks Completed</div>
            <button className="mt-4 w-full rounded-xl border border-border bg-secondary/60 py-2 text-sm font-semibold text-foreground hover:bg-accent transition">
              View Tasks
            </button>
          </div>
        </div>

        {/* Streak */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-baseline gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <div className="text-3xl font-extrabold">12</div>
          </div>
          <div className="text-lg font-bold">Day Streak</div>
          <p className="mt-3 text-sm text-muted-foreground">Amazing! Keep it up, you're on fire! 🔥</p>
          <img src={mountains} alt="" className="mt-4 h-24 w-full rounded-2xl object-cover" width={320} height={96} loading="lazy" />
        </div>
      </div>

      {/* Row 2: Continue Learning + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Continue Learning</h3>
            <a className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-0.5">View all <ChevronRight className="h-4 w-4" /></a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img src={s.img} alt={s.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" width={200} height={150} loading="lazy" />
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.topic}</div>
                  <div className="mt-2 text-[10px] font-semibold text-muted-foreground">{s.pct}% complete</div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming</h3>
            <a className="text-sm font-semibold text-primary hover:underline">View Calendar</a>
          </div>
          <div className="space-y-3">
            {[
              { i: Calendar, t: "Math Assignment", s: "Due in 2 hours" },
              { i: HelpCircle, t: "Chemistry Quiz", s: "Tomorrow, 10:00 AM" },
              { i: Users, t: "Study Group", s: "Sunday, 7:00 PM" },
            ].map((e, i) => {
              const Icon = e.i;
              return (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{e.t}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: AI in Action + Study Groups + Flashcards + Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* AI in Action */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">AI Tutor in Action</h3>
          <div className="mt-4 space-y-3">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground">
              Explain photosynthesis in simple terms.
            </div>
            <div className="flex gap-2">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Brain className="h-3.5 w-3.5" /></div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground">
                Photosynthesis is how plants make their own food. They take in sunlight, CO₂, and water, and turn it into glucose and oxygen.
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-4 pr-1 py-1">
            <input placeholder="Ask me anything…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Study Groups */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Study Groups</h3>
            <a className="text-xs font-semibold text-primary hover:underline">View all</a>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { name: "AS Mathematics Group", members: 12, badge: 7 },
              { name: "Biology Buddies", members: 8, badge: 3 },
              { name: "Physics Champions", members: 15, badge: 9 },
            ].map((g) => (
              <div key={g.name} className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {g.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{g.name}</div>
                  <div className="text-xs text-muted-foreground">{g.members} members</div>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">{g.badge}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition">
            + Create New Group
          </button>
        </div>

        {/* Flashcards */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">Flashcards</h3>
          <div className="mt-4 rounded-2xl bg-gradient-soft p-5 text-center min-h-[130px] flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary/70">Question</div>
            <div className="mt-2 text-sm font-bold">What is the powerhouse of the cell?</div>
            <div className="mt-3 text-xs text-muted-foreground">Tap to reveal</div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>12 / 50</span>
            <div className="flex gap-1.5">
              <button className="grid h-7 w-7 place-items-center rounded-full border border-border bg-secondary"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
              <button className="grid h-7 w-7 place-items-center rounded-full bg-success text-white"><CheckCircle2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-primary rounded-full" />
          </div>
        </div>

        {/* Quizzes */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">Quizzes</h3>
          <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
            <div className="text-sm font-semibold">Biology Quiz</div>
            <div className="text-xs text-muted-foreground">Cell Structure</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="text-3xl font-extrabold text-success">85%</div>
            <div className="text-xs text-success/80 font-semibold">17 / 20 correct</div>
          </div>
          <button className="mt-4 w-full rounded-xl bg-gradient-primary py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-elegant transition">
            Review Answers
          </button>
        </div>
      </div>

      {/* Row 4: Your Progress */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">Your Progress</h3>
          <select className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold">
            <option>This Week</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Study Time", v: "12h 45m", d: "+15% from last week", i: TrendingUp },
            { l: "Quizzes Taken", v: "24", d: "+20% from last week", i: HelpCircle },
            { l: "Accuracy", v: "87%", d: "+8% from last week", i: Trophy },
            { l: "XP Gained", v: "1,250", d: "+30% from last week", i: Zap },
          ].map((k) => {
            const Icon = k.i;
            return (
              <div key={k.l} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{k.l}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-2xl font-extrabold">{k.v}</div>
                <div className="mt-1 text-[11px] font-semibold text-success">{k.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="pr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="currentColor" className="text-muted" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="url(#pr)" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" fill="none" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xl font-extrabold">{value}%</div>
    </div>
  );
}