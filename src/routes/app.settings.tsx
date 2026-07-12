import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import avatar from "@/assets/avatar-frank.jpg";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Settings" subtitle="Tune Coretex to fit you." />
      <div className="max-w-3xl space-y-5">
        <Section title="Profile">
          <div className="flex items-center gap-4">
            <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20" width={80} height={80} />
            <div className="flex-1">
              <input defaultValue="Frank Osafo" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              <input defaultValue="frank@coretex.app" className="mt-2 w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
          </div>
        </Section>
        <Section title="Preferences">
          {[
            ["Daily study reminders", true],
            ["Weekly progress email", true],
            ["Sound effects", false],
            ["Show streaks on profile", true],
          ].map(([l, on]) => (
            <Row key={l as string} label={l as string} on={on as boolean} />
          ))}
        </Section>
        <Section title="AI Tutor">
          <Row label="Suggest AI actions on notes" on />
          <Row label="Auto-generate flashcards from lessons" on />
          <Row label="Explain in simpler language by default" on={false} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Row({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 border-border/60 py-3">
      <span className="text-sm">{label}</span>
      <div className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-primary" : "bg-muted"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </div>
    </div>
  );
}