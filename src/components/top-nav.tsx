import { Search, Bell, MessageSquare, Calendar as CalIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAiAssistant } from "@/components/ai-assistant";

export function TopNav() {
  const { profile, user } = useAuth();
  const { open } = useAiAssistant();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "You";
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search Coretex — courses, notes, friends…"
            className="h-11 w-full rounded-full border border-border bg-secondary/60 pl-11 pr-24 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={open} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
          <NavIcon><CalIcon className="h-5 w-5" /></NavIcon>
          <NavIcon badge><MessageSquare className="h-5 w-5" /></NavIcon>
          <NavIcon badge><Bell className="h-5 w-5" /></NavIcon>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="ml-1 h-10 w-10 rounded-full object-cover ring-2 ring-border" width={40} height={40} />
          ) : (
            <div className="ml-1 h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold ring-2 ring-border">{initials}</div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavIcon({ children, badge }: { children: React.ReactNode; badge?: boolean }) {
  return (
    <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition">
      {children}
      {badge && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-primary ring-2 ring-background" />}
    </button>
  );
}