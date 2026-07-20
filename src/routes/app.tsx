import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { ensurePersonalTimetable } from "@/lib/timetable.functions";
import { AiAssistantProvider } from "@/components/ai-assistant";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const ensureTimetable = useServerFn(ensurePersonalTimetable);
  const ranTimetable = useRef(false);

  useEffect(() => {
    if (!loading && !session) nav({ to: "/login" });
  }, [loading, session, nav]);

  useEffect(() => {
    if (!session || ranTimetable.current) return;
    ranTimetable.current = true;
    ensureTimetable().catch(() => { ranTimetable.current = false; });
  }, [session, ensureTimetable]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AiAssistantProvider>
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
    </AiAssistantProvider>
  );
}