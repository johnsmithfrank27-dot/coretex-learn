import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Heart, MessageCircle, Bookmark, Share2, Sparkles, Layers, FileText, Image as ImageIcon, Mic, Video, HelpCircle, BarChart3, Trophy, Users, Calendar } from "lucide-react";
import avatar from "@/assets/avatar-frank.jpg";
import bio from "@/assets/subject-biology.jpg";
import phy from "@/assets/subject-physics.jpg";

export const Route = createFileRoute("/_app/social")({ component: Social });

function Social() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Social Learning" subtitle="Learn out loud. Share, ask, teach." />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          {/* Composer */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" width={40} height={40} />
              <input placeholder="Share a question, notes, or a win…" className="h-11 flex-1 rounded-full border border-border bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { i: HelpCircle, l: "Question" }, { i: FileText, l: "Notes" }, { i: Layers, l: "Flashcards" },
                { i: Sparkles, l: "Quiz" }, { i: ImageIcon, l: "Image" }, { i: Video, l: "Video" },
                { i: Mic, l: "Voice" }, { i: BarChart3, l: "Poll" },
              ].map((a) => { const I = a.i; return (
                <button key={a.l} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold hover:bg-accent transition">
                  <I className="h-3.5 w-3.5 text-primary" /> {a.l}
                </button>
              ); })}
            </div>
          </div>

          <Post name="Ama Serwaa" subject="Mathematics" time="2h" body="Just finished solving this quadratic problem. Can someone check my working?" formula />
          <Post name="Kofi Mensah" subject="Physics" time="3h" body="Explaining Newton's 2nd Law with a simple example 👇" image={phy} />
          <Post name="Lily Chen" subject="Biology" time="5h" body="Made flashcards for the entire cell chapter. Free for anyone who needs them!" image={bio} />
        </div>

        <aside className="space-y-4">
          <SidePanel title="Today's Challenge" icon={Trophy}>
            <div className="text-sm">Solve 5 algebra problems in under 10 minutes.</div>
            <button className="mt-3 w-full rounded-xl bg-gradient-primary py-2 text-xs font-semibold text-primary-foreground">Accept challenge</button>
          </SidePanel>
          <SidePanel title="Study Groups" icon={Users}>
            {["AS Mathematics", "Biology Buddies", "Physics Champions"].map(g => (
              <div key={g} className="flex items-center justify-between py-1.5 text-sm">
                <span>{g}</span><button className="text-xs font-semibold text-primary hover:underline">Join</button>
              </div>
            ))}
          </SidePanel>
          <SidePanel title="Leaderboard" icon={Trophy}>
            {[["Ama", "3,120"], ["Frank", "2,890"], ["Kofi", "2,540"]].map(([n, xp], i) => (
              <div key={n} className="flex items-center justify-between py-1.5 text-sm">
                <span><b className="text-primary mr-1">#{i+1}</b> {n}</span><span className="text-muted-foreground">{xp} XP</span>
              </div>
            ))}
          </SidePanel>
          <SidePanel title="Upcoming Events" icon={Calendar}>
            <div className="text-sm">Bio Quiz — Tomorrow 10 AM</div>
            <div className="text-sm mt-1">Math Bootcamp — Sat 3 PM</div>
          </SidePanel>
        </aside>
      </div>
    </div>
  );
}

function Post({ name, subject, time, body, image, formula }: { name: string; subject: string; time: string; body: string; image?: string; formula?: boolean }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold">{name[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">Posted in {subject} · {time}</div>
        </div>
      </header>
      <p className="mt-3 text-sm leading-relaxed">{body}</p>
      {formula && (
        <div className="mt-3 rounded-2xl bg-secondary/50 p-4 font-mono text-sm text-center">
          x² − 5x + 6 = 0 &nbsp; ⟹ &nbsp; (x−2)(x−3) = 0 &nbsp; ⟹ &nbsp; x = 2 or x = 3
        </div>
      )}
      {image && <img src={image} alt="" className="mt-3 aspect-video w-full rounded-2xl object-cover" loading="lazy" />}
      <footer className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-1 hover:text-primary transition"><Heart className="h-4 w-4" /> 24</button>
          <button className="inline-flex items-center gap-1 hover:text-primary transition"><MessageCircle className="h-4 w-4" /> 12</button>
          <button className="inline-flex items-center gap-1 hover:text-primary transition"><Share2 className="h-4 w-4" /> Share</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold hover:bg-accent"><Sparkles className="inline h-3 w-3 text-primary mr-1" />Ask AI</button>
          <button className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold hover:bg-accent">Flashcards</button>
          <button className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold hover:bg-accent">Quiz me</button>
          <button className="hover:text-primary transition"><Bookmark className="h-4 w-4" /></button>
        </div>
      </footer>
    </article>
  );
}

function SidePanel({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-center gap-2 font-bold"><Icon className="h-4 w-4 text-primary" />{title}</div>
      {children}
    </div>
  );
}