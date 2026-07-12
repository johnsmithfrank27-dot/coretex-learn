import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import {
  Sparkles, Play, Brain, Users, Layers, HelpCircle, StickyNote, TrendingUp,
  Trophy, MessageCircle, ArrowRight, Star, Check, Zap, Flame, BookOpen,
  UserPlus, Compass, Target, GraduationCap,
} from "lucide-react";
import heroImg from "@/assets/hero-dashboard.jpg";
import aiMascot from "@/assets/ai-mascot.png";
import avatar from "@/assets/avatar-frank.jpg";
import mathImg from "@/assets/subject-math.jpg";
import bioImg from "@/assets/subject-biology.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coretex — The Future of Learning" },
      { name: "description", content: "AI tutoring, social learning, flashcards, quizzes and gamification — all in one beautifully designed platform." },
      { property: "og:title", content: "Coretex — The Future of Learning" },
      { property: "og:description", content: "The AI-native learning platform for the next generation of students." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <MarketingNav />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <SocialLearning />
      <AIShowcase />
      <Gamification />
      <Testimonials />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[400px] w-[400px] rounded-full bg-accent/40 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-3 py-1 text-xs font-semibold text-primary shadow-soft">
            <Sparkles className="h-3.5 w-3.5" /> Introducing Coretex AI · Qwen 3
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            The Future of<br />
            <span className="bg-clip-text text-transparent bg-gradient-hero">Learning</span> Starts Here.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Coretex combines an AI tutor, social study, personalized notes, flashcards, quizzes and gamified progress — into one calm, beautiful ecosystem built for how the next generation actually learns.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-secondary transition">
              <Play className="h-4 w-4 text-primary" /> Watch Demo
            </button>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[0,1,2,3].map((i) => (
                <img key={i} src={avatar} alt="" className="h-8 w-8 rounded-full ring-2 ring-background object-cover" />
              ))}
            </div>
            <div><span className="font-semibold text-foreground">120,000+</span> students already learning smarter</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-[2.5rem] blur-3xl opacity-30" />
          <div className="relative rounded-[2rem] border border-border bg-card p-2 shadow-elegant">
            <img src={heroImg} alt="Coretex dashboard preview" width={1600} height={1200} className="w-full rounded-[1.5rem]" />
          </div>
          <FloatingCard className="-left-6 top-10" delay="0s">
            <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><span className="text-xs font-semibold">AI Tutor</span></div>
            <div className="mt-1 text-xs text-muted-foreground">Explained integrals in 3 steps</div>
          </FloatingCard>
          <FloatingCard className="-right-4 top-32" delay="1s">
            <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-warning" /><span className="text-xs font-semibold">12-day streak</span></div>
            <div className="mt-1 flex gap-1">{Array.from({length:7}).map((_,i)=><div key={i} className={`h-1.5 w-4 rounded-full ${i<6?'bg-gradient-streak':'bg-muted'}`}/>)}</div>
          </FloatingCard>
          <FloatingCard className="-left-2 -bottom-4" delay="2s">
            <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /><span className="text-xs font-semibold">Level 24 · 4,230 XP</span></div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ children, className, delay }: { children: React.ReactNode; className?: string; delay?: string }) {
  return (
    <div
      style={{ animationDelay: delay, animationDuration: "6s" }}
      className={`absolute glass rounded-2xl px-3 py-2 shadow-elegant animate-[fade-in_0.5s_ease-out] ${className ?? ""}`}
    >
      <div className="animate-pulse-slow">{children}</div>
    </div>
  );
}

function SocialProof() {
  const stats = [
    { v: "120K+", l: "Students helped" },
    { v: "4.8M", l: "AI questions answered" },
    { v: "12K", l: "Study groups" },
    { v: "980K", l: "Lessons completed" },
    { v: "3.2M", l: "Quizzes generated" },
  ];
  return (
    <section className="border-y border-border bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-primary">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground font-medium">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { i: Brain, t: "AI Tutor", d: "24/7 personal AI that explains, quizzes, and adapts to your pace." },
    { i: Users, t: "Social Learning", d: "Learn with friends. Post questions, share notes, discuss ideas." },
    { i: Layers, t: "Flashcards", d: "Spaced-repetition decks auto-generated from your notes." },
    { i: MessageCircle, t: "Study Groups", d: "Voice rooms, shared notes, group challenges — together is better." },
    { i: StickyNote, t: "Smart Notes", d: "AI-organized notebooks with automatic summaries." },
    { i: HelpCircle, t: "Quizzes", d: "Instant quizzes from any topic, with AI explanations." },
    { i: TrendingUp, t: "Analytics", d: "Beautiful progress dashboards that show what actually works." },
    { i: Trophy, t: "Gamification", d: "XP, streaks, badges and leaderboards that make learning stick." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead
        eyebrow="Everything you need"
        title="One platform. Every tool that helps you learn."
        subtitle="Designed to replace the messy stack of apps students juggle today."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <div key={t(f.t)} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" />
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <f.i className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-bold">{f.t}</div>
            <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function t(s: string) { return s; }

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { i: UserPlus, t: "Create your account", d: "30 seconds. No credit card." },
    { i: Compass, t: "Choose your subjects", d: "Math, science, languages, exams." },
    { i: Brain, t: "Meet your AI Tutor", d: "Tuned to how you actually learn." },
    { i: Users, t: "Join study groups", d: "Learn alongside friends and peers." },
    { i: GraduationCap, t: "Master your exams", d: "Track mastery, ship your goals." },
  ];
  return (
    <section id="how" className="bg-gradient-soft border-y border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="How it works" title="From zero to fluent in five steps." />
        <div className="mt-14 grid gap-5 md:grid-cols-5">
          {steps.map((s, idx) => (
            <div key={s.t} className="relative rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs font-bold text-primary">STEP {idx+1}</div>
              <div className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <s.i className="h-5 w-5" />
              </div>
              <div className="mt-3 font-bold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialLearning() {
  return (
    <section id="community" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeadLeft eyebrow="Social learning" title="Every post is smarter with AI inside." subtitle="Ask questions, share notes, jam on flashcards. AI drops in with instant explanations, voice discussions and study challenges — without breaking your flow." />
          <ul className="mt-8 space-y-3">
            {["Question posts with AI explanations","Voice-first study rooms","Shared flashcard decks","Weekly study challenges"].map((x)=>(
              <li key={x} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> {x}</li>
            ))}
          </ul>
        </div>
        <FeedMockup />
      </div>
    </section>
  );
}

function SectionHeadLeft({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function FeedMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-primary rounded-[2.5rem] blur-3xl opacity-20" />
      <div className="relative rounded-3xl border border-border bg-card p-5 shadow-elegant space-y-4">
        <div className="flex items-center gap-3">
          <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <div className="text-sm font-semibold">Amara · asked in Calculus II</div>
            <div className="text-xs text-muted-foreground">2m ago</div>
          </div>
        </div>
        <div className="text-sm">Why does the derivative of e^x stay e^x? It feels like magic.</div>
        <div className="rounded-2xl border border-primary/20 bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> AI Explanation</div>
          <div className="mt-1 text-sm">Because e is defined as the number whose exponential function equals its own slope everywhere. Think of it as the perfectly balanced growth curve…</div>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="rounded-full bg-secondary px-3 py-1 font-medium">Explain again</button>
          <button className="rounded-full bg-secondary px-3 py-1 font-medium">Make flashcards</button>
          <button className="rounded-full bg-secondary px-3 py-1 font-medium">Quiz me</button>
        </div>
      </div>
    </div>
  );
}

function AIShowcase() {
  const chips = ["Explain Again","Generate Quiz","Flashcards","Simplify","Translate","Mind Map","Voice Explanation"];
  return (
    <section id="ai" className="bg-gradient-soft border-y border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-elegant">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <img src={aiMascot} alt="Coretex AI" className="h-10 w-10 rounded-2xl" />
              <div>
                <div className="text-sm font-semibold">Coretex AI</div>
                <div className="text-xs text-success">● Online · Qwen 3 32B</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground w-fit">Can you explain photosynthesis like I'm 12?</div>
              <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2 text-sm">Sure! Plants are tiny solar factories. Their leaves catch sunlight, breathe in CO₂, drink water — and cook up sugar and oxygen. 🌱</div>
              <div className="flex flex-wrap gap-2 pt-2">
                {chips.map(c => <button key={c} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary transition">{c}</button>)}
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeadLeft eyebrow="AI Tutor" title="An AI that teaches, not just answers." subtitle="Coretex AI plans your studies, generates practice, and adapts explanations to your level. It runs the whole app for you — from your dashboard to your next quiz." />
          <Link to="/app/ai-tutor" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
            Try the AI Tutor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Gamification() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="Gamification" title="Learning that feels like winning." />
      <div className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
        {[
          { i: Zap, t: "XP", v: "4,230" },
          { i: Target, t: "Level", v: "24" },
          { i: Trophy, t: "Badges", v: "38" },
          { i: Flame, t: "Streak", v: "12d" },
          { i: BookOpen, t: "Lessons", v: "146" },
          { i: Star, t: "Rank", v: "#128" },
        ].map((k) => (
          <div key={k.t} className="rounded-3xl border border-border bg-card p-5 text-center shadow-soft hover:shadow-elegant transition">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant"><k.i className="h-5 w-5" /></div>
            <div className="mt-3 text-2xl font-extrabold">{k.v}</div>
            <div className="text-xs font-medium text-muted-foreground">{k.t}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-border bg-gradient-hero p-8 text-primary-foreground shadow-elegant">
          <div className="text-xs font-semibold uppercase tracking-widest opacity-80">Weekly Leaderboard</div>
          <div className="mt-2 text-3xl font-extrabold">You're in the top 3% this week</div>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">Keep it up — 2 lessons away from Level 25.</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Achievements</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Night Owl","Bookworm","Speedster","AI Whisperer","Streak Master","Team Player"].map(a=>(
              <span key={a} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { n: "Zoe M.", r: "Med student, Yale", q: "Coretex is the first study app that actually feels calm. The AI explains things the way my professor should." },
    { n: "Daniel A.", r: "A-Level student, London", q: "I went from a C in Physics to an A* in one term. The flashcards and social groups changed everything." },
    { n: "Priya S.", r: "IIT aspirant", q: "It's Notion + ChatGPT + Duolingo — but designed with actual taste. Feels like the future." },
  ];
  return (
    <section className="bg-gradient-soft border-y border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Loved by students" title="From late-night cramming to acing exams." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((x) => (
            <div key={x.n} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-warning">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 text-base leading-relaxed">"{x.q}"</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero px-8 py-20 text-center text-primary-foreground shadow-elegant">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 30%), radial-gradient(circle at 80% 70%, white, transparent 30%)" }} />
        <div className="relative">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Ready to transform<br />the way you learn?</h2>
          <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">Join 120,000+ students already using Coretex. Free forever. Upgrade anytime.</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-primary shadow-elegant hover:shadow-glow transition-all">
              Start Learning Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-sm font-semibold hover:bg-white/10 transition">Sign In</Link>
          </div>
        </div>
      </div>
    </section>
  );
}