import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  LogOut,
} from "lucide-react";
import { CoretexLogo } from "./coretex-logo";
import { useAuth } from "@/lib/auth-context";

const navItems = [
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
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "You";
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6">
      <div className="px-2 mb-8">
        <CoretexLogo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
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
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20" />
          ) : (
            <div className="h-11 w-11 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold ring-2 ring-primary/20">{initials}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{displayName}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded-md bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">{(profile?.xp ?? 0)} XP</span>
              <span className="inline-flex items-center gap-0.5 text-warning"><Flame className="h-3 w-3" /> {profile?.streak_days ?? 0}</span>
            </div>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}