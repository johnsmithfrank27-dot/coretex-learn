import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Flame, Zap, MessageCircle, StickyNote, Layers, HelpCircle, Users, ArrowRight } from "lucide-react";
import aiMascot from "@/assets/ai-mascot.png";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Coretex" }, { name: "description", content: "Your learning dashboard." }] }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const { user, profile } = useAuth();
  const name = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          {greeting()}, {name}! <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Ready to make today amazing?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-soft p-6 shadow-soft">
          <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">AI Tutor</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow-soft">
                <Sparkles className="h-3 w-3" /> Powered by Lovable AI
              </span>
              <p className="mt-4 max-w-xs text-sm text-foreground/80 leading-relaxed">
                Ask a question, get an instant explanation, generate practice — all in one chat.
              </p>
              <Link to="/app/ai-tutor" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
                <MessageCircle className="h-4 w-4" /> Chat with AI Tutor
              </Link>
            </div>
            <img src={aiMascot} alt="AI Tutor" className="h-44 w-44 shrink-0 object-contain drop-shadow-xl" width={200} height={200} />
          </div>
        </div>

        <StatCard icon={Zap} label="Total XP" value={String(profile?.xp ?? 0)} hint="Earn XP by learning" />
        <StatCard icon={Flame} label="Day streak" value={String(profile?.streak_days ?? 0)} hint="Show up daily to grow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <QuickCard icon={StickyNote} title="Notes" to="/app/notes" desc="Write & organize" />
        <QuickCard icon={Layers} title="Flashcards" to="/app/flashcards" desc="Practice with spaced repetition" />
        <QuickCard icon={HelpCircle} title="Quizzes" to="/app/quizzes" desc="Test what you know" />
        <QuickCard icon={Users} title="Study Groups" to="/app/study-groups" desc="Learn with others" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Zap; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-4xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function QuickCard({ icon: Icon, title, to, desc }: { icon: typeof Zap; title: string; to: string; desc: string }) {
  return (
    <Link to={to} className="group rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-base font-bold">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}