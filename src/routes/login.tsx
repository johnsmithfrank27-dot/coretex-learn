import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CoretexLogo } from "@/components/coretex-logo";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import authImg from "@/assets/auth-illustration.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Coretex" }, { name: "description", content: "Welcome back to Coretex." }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-hero p-10 text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 30%), radial-gradient(circle at 80% 80%, white, transparent 30%)" }} />
        <Link to="/" className="relative"><div className="inline-flex items-center gap-2 text-primary-foreground"><CoretexLogo /></div></Link>
        <div className="relative flex-1 flex items-center justify-center">
          <img src={authImg} alt="" width={1200} height={1600} className="max-h-[520px] rounded-3xl drop-shadow-2xl" />
        </div>
        <div className="relative">
          <div className="text-3xl font-extrabold leading-tight">Learn smarter.<br />Together.</div>
          <p className="mt-2 text-sm opacity-90 max-w-sm">Your AI tutor, notes, flashcards and study groups — all in one calm, beautiful workspace.</p>
        </div>
      </aside>
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Link to="/"><CoretexLogo /></Link></div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your learning journey.</p>
          <form onSubmit={(e)=>{e.preventDefault(); nav({ to: "/app" });}} className="mt-8 space-y-4">
            <Field icon={Mail} label="Email" type="email" placeholder="you@school.edu" />
            <div>
              <Field icon={Lock} label="Password" type={show?"text":"password"} placeholder="••••••••"
                trailing={<button type="button" onClick={()=>setShow(s=>!s)} className="text-muted-foreground hover:text-foreground">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded border-border" /> Remember me</label>
              <a href="#" className="text-primary font-semibold">Forgot password?</a>
            </div>
            <button className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">Sign In <ArrowRight className="h-4 w-4" /></button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
          <div className="space-y-2">
            <OAuth label="Continue with Google" />
            <OAuth label="Continue with Microsoft" />
            <OAuth label="Continue with Apple" />
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="font-semibold text-primary">Sign up</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, trailing, ...p }: { icon: React.ElementType; label: string; trailing?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input {...p} className="h-12 w-full rounded-2xl border border-border bg-secondary/40 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition" />
        {trailing && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </label>
  );
}

function OAuth({ label }: { label: string }) {
  return (
    <button className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold hover:bg-secondary transition">
      {label}
    </button>
  );
}