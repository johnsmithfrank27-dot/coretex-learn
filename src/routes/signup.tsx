import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CoretexLogo } from "@/components/coretex-logo";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import authImg from "@/assets/auth-illustration.jpg";
import aiMascot from "@/assets/ai-mascot.png";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — Coretex" }, { name: "description", content: "Start learning with Coretex." }] }),
  component: Signup,
});

const steps = ["Account","School","Subjects","Goals","Meet AI"] as const;

function Signup() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const next = () => step < steps.length - 1 ? setStep(step+1) : nav({ to: "/app" });
  const back = () => setStep(Math.max(0, step-1));

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

          {step === 0 && <StepAccount />}
          {step === 1 && <StepSchool />}
          {step === 2 && <StepSubjects />}
          {step === 3 && <StepGoals />}
          {step === 4 && <StepMeetAI />}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={back} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold hover:bg-secondary transition"><ArrowLeft className="h-4 w-4" /> Back</button>
            ) : <div />}
            <button onClick={next} className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
              {step === steps.length - 1 ? "Enter Coretex" : "Continue"} <ArrowRight className="h-4 w-4" />
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

function StepAccount() {
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Takes 30 seconds. No credit card.</p>
      <div className="mt-6 space-y-3">
        <Input label="Full name" placeholder="Alex Chen" />
        <Input label="Email" type="email" placeholder="you@school.edu" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Input label="Confirm password" type="password" placeholder="••••••••" />
      </div>
    </div>
  );
}

function StepSchool() {
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Where do you study?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Helps us tailor your dashboard.</p>
      <div className="mt-6 space-y-3">
        <Input label="Country" placeholder="Ghana" />
        <Input label="School / University" placeholder="KNUST" />
        <div>
          <div className="text-xs font-semibold mb-1.5">Education level</div>
          <div className="grid grid-cols-2 gap-2">
            {["High School","Undergrad","Graduate","Self-study"].map(l=>(
              <button key={l} className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium hover:border-primary hover:text-primary transition">{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepSubjects() {
  const subjects = ["Math","Physics","Chemistry","Biology","English","History","Coding","Economics","Languages"];
  const [picked, setPicked] = useState<string[]>(["Math","Physics"]);
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Pick your subjects</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose as many as you like.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {subjects.map(s=>{
          const on = picked.includes(s);
          return (
            <button key={s} onClick={()=>setPicked(on?picked.filter(x=>x!==s):[...picked,s])}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${on?"bg-gradient-primary text-primary-foreground border-transparent shadow-elegant":"border-border bg-background hover:border-primary hover:text-primary"}`}>
              {on && <Check className="inline h-3.5 w-3.5 mr-1" />}{s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepGoals() {
  const goals = ["Ace exams","Learn faster","Build habits","Compete with friends","Explore new topics"];
  return (
    <div className="mt-2">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">What are your goals?</h1>
      <p className="mt-2 text-sm text-muted-foreground">We'll adapt your study plan and AI tutor.</p>
      <div className="mt-6 grid gap-2">
        {goals.map(g=>(
          <label key={g} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 cursor-pointer hover:border-primary transition">
            <input type="checkbox" className="rounded border-border" />
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