import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Coretex" }, { name: "description", content: "Update your profile and preferences." }] }),
  component: Settings,
});

function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setSchool(profile.school ?? "");
      setLevel(profile.education_level ?? "");
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName || null,
      school: school || null,
      education_level: level || null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Profile updated");
  }

  async function handleSignOut() {
    await signOut();
    nav({ to: "/" });
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Settings" subtitle="Tune Coretex to fit you." />
      <form onSubmit={save} className="max-w-3xl space-y-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-bold mb-4">Profile</h3>
          <div className="space-y-3">
            <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
            <Field label="Email" value={user?.email ?? ""} onChange={() => {}} disabled />
            <Field label="School / University" value={school} onChange={setSchool} placeholder="e.g. KNUST" />
            <Field label="Education level" value={level} onChange={setLevel} placeholder="e.g. Undergrad" />
          </div>
          <button disabled={saving} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-bold mb-2">Account</h3>
          <p className="text-sm text-muted-foreground mb-4">Sign out of Coretex on this device.</p>
          <button type="button" onClick={handleSignOut} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-secondary transition">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, disabled, placeholder }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60" />
    </label>
  );
}