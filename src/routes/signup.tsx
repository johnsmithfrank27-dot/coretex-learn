import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CoretexLogo } from "@/components/coretex-logo";
import { ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from "lucide-react";
import authImg from "@/assets/auth-illustration.jpg";
import aiMascot from "@/assets/ai-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — Coretex" }, { name: "description", content: "Start learning with Coretex." }] }),
  component: Signup,
});

const steps = ["Account","School","Subjects","Goals","Meet AI"] as const;

function Signup() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const { session, user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    displayName: "", email: "", password: "", confirm: "",
    country: "", school: "", level: "",
    subjects: [] as string[], goals: [] as string[],
  });

  useEffect(() => { if (session && step === 0) setStep(1); }, [session]);

  async function handleAccountStep() {
    if (!form.email || !form.password) return toast.error("Email and password required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: form.displayName || form.email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    setStep(1);
  }

  async function saveProfileAndFinish() {
    if (!user) { nav({ to: "/app" }); return; }
    setBusy(true);
    await supabase.from("profiles").update({
      display_name: form.displayName || null,
      school: form.school || null,
      education_level: form.level || null,
      subjects: form.subjects,
      goals: form.goals,
    }).eq("id", user.id);
    await refreshProfile();
    setBusy(false);
    nav({ to: "/app" });
  }

  async function next() {
    if (step === 0) return handleAccountStep();
    if (step === steps.length - 1) return saveProfileAndFinish();
    setStep(step + 1);
  }
  const back = () => setStep(Math.max(0, step-1));

  async function handleGoogle() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setBusy(false);
    if (res.error) toast.error(String(res.error.message ?? res.error));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-hero p-10 text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white, transparent 30%), radial-gradient(circle at 70% 80%, white, transparent 30%)" }} />
        <Link to="/" className="relative"><CoretexLogo /></Link>
        <div className="relative flex-1 flex items-center justify-center">
          <img src={authImg} alt="" width={1200} height={1600} className="max-h-[520px] rounded-3xl drop-shadow-2xl" />
        </div>
        <div className="relative">
          <div className="text-3xl font-extrabold leading-tight">A better way to<br />become brilliant.</div>
          <p className="mt-2 text-sm opacity-90 max-w-sm">Join 120,000+ students learning with Coretex. Free forever.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6"><Link to="/"><CoretexLogo /></Link></div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-gradient-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Step {step+1} of {steps.length}</div>

          {step === 0 && <StepAccount form={form} setForm={setForm} onGoogle={handleGoogle} />}
          {step === 1 && <StepSchool form={form} setForm={setForm} />}
          {step === 2 && <StepSubjects form={form} setForm={setForm} />}
          {step === 3 && <StepGoals form={form} setForm={setForm} />}
          {step === 4 && <StepMeetAI />}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={back} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold hover:bg-secondary transition"><ArrowLeft className="h-4 w-4" /> Back</button>
            ) : <div />}
            <button onClick={next} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{step === steps.length - 1 ? "Enter Coretex" : step === 0 ? "Create account" : "Continue"} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>

          {step === 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-semibold text-primary">Sign in</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Input({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <input {...p} className="h-12 w-full rounded-2xl border border-border bg-secondary/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition" />
    </label>
  );
}

type FormState = {
  displayName: string; email: string; password: string; confirm: string;
  country: string; school: string; level: string;
  subjects: string[]; goals: string[];
};
type StepProps = { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> };

function StepAccount({ form, setForm, onGoogle }: StepProps & { onGoogle: () => void }) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Takes 30 seconds. No credit card.</p>
      <div className="mt-6 space-y-3">
        <Input label="Full name" placeholder="Alex Chen" value={form.displayName} onChange={set("displayName")} />
        <Input label="Email" type="email" placeholder="you@school.edu" value={form.email} onChange={set("email")} required />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
        <Input label="Confirm password" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} required />
      </div>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
      <button type="button" onClick={onGoogle} className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold hover:bg-secondary transition">
        Continue with Google
      </button>
    </div>
  );
}

function StepSchool({ form, setForm }: StepProps) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Where do you study?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Helps us tailor your dashboard.</p>
      <div className="mt-6 space-y-3">
        <Input label="Country" placeholder="Ghana" value={form.country} onChange={set("country")} />
        <Input label="School / University" placeholder="KNUST" value={form.school} onChange={set("school")} />
        <div>
          <div className="text-xs font-semibold mb-1.5">Education level</div>
          <div className="grid grid-cols-2 gap-2">
            {["High School","Undergrad","Graduate","Self-study"].map(l=>{
              const on = form.level === l;
              return (
                <button type="button" key={l} onClick={() => setForm(f => ({ ...f, level: l }))} className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${on ? "border-primary text-primary bg-primary/5" : "border-border bg-secondary/40 hover:border-primary hover:text-primary"}`}>{l}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepSubjects({ form, setForm }: StepProps) {
  const subjects = ["Math","Physics","Chemistry","Biology","English","History","Coding","Economics","Languages"];
  const picked = form.subjects;
  const toggle = (s: string) => setForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }));
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Pick your subjects</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose as many as you like.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {subjects.map(s=>{
          const on = picked.includes(s);
          return (
            <button type="button" key={s} onClick={()=>toggle(s)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${on?"bg-gradient-primary text-primary-foreground border-transparent shadow-elegant":"border-border bg-background hover:border-primary hover:text-primary"}`}>
              {on && <Check className="inline h-3.5 w-3.5 mr-1" />}{s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepGoals({ form, setForm }: StepProps) {
  const goals = ["Ace exams","Learn faster","Build habits","Compete with friends","Explore new topics"];
  const toggle = (g: string) => setForm(f => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g] }));
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">What are your goals?</h1>
      <p className="mt-2 text-sm text-muted-foreground">We'll adapt your study plan and AI tutor.</p>
      <div className="mt-6 grid gap-2">
        {goals.map(g=>(
          <label key={g} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 cursor-pointer hover:border-primary transition">
            <input type="checkbox" className="rounded border-border" checked={form.goals.includes(g)} onChange={() => toggle(g)} />
            <span className="text-sm font-medium">{g}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepMeetAI() {
  return (
    <div className="mt-2">
      <div className="mt-2 flex items-center gap-3">
        <img src={aiMascot} alt="AI" className="h-16 w-16 rounded-3xl shadow-elegant" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Meet your AI Tutor</h1>
          <p className="text-sm text-muted-foreground">Powered by Coretex AI.</p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-border bg-gradient-soft p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Your personalized plan is ready</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Daily 25-minute focused sessions</li>
          <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Adaptive quizzes after each topic</li>
          <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Weekly progress report</li>
          <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Study group recommendations</li>
        </ul>
      </div>
    </div>
  );
}