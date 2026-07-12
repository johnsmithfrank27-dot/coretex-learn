import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Sparkles,
  BookOpen,
  Users,
  UsersRound,
  StickyNote,
  Layers,
  HelpCircle,
  TrendingUp,
  Calendar,
  Trophy,
  Library,
  Settings,
  Flame,
} from "lucide-react";
import { CoretexLogo } from "./coretex-logo";
import avatarFrank from "@/assets/avatar-frank.jpg";

const nav = [
  { title: "Home", url: "/app", icon: Home },
  { title: "AI Tutor", url: "/app/ai-tutor", icon: Sparkles },
  { title: "Learn", url: "/app/learn", icon: BookOpen },
  { title: "Social", url: "/app/social", icon: Users },
  { title: "Study Groups", url: "/app/study-groups", icon: UsersRound },
  { title: "Notes", url: "/app/notes", icon: StickyNote },
  { title: "Flashcards", url: "/app/flashcards", icon: Layers },
  { title: "Quizzes", url: "/app/quizzes", icon: HelpCircle },
  { title: "Progress", url: "/app/progress", icon: TrendingUp },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Leaderboards", url: "/app/leaderboards", icon: Trophy },
  { title: "Resources", url: "/app/resources", icon: Library },
  { title: "Settings", url: "/app/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6">
      <div className="px-2 mb-8">
        <CoretexLogo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {nav.map((item) => {
          const active = currentPath === item.url;
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"}`} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="flex items-center gap-3">
          <img src={avatarFrank} alt="Frank" className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20" width={44} height={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Frank Osafo</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded-md bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">Level 24</span>
              <span className="inline-flex items-center gap-0.5 text-warning"><Flame className="h-3 w-3" /> 12</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>4,230 XP</span>
            <span>6,000 XP</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[70%] bg-gradient-primary rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}