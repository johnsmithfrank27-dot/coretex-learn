import { Link } from "@tanstack/react-router";
import { CoretexLogo } from "@/components/coretex-logo";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const links = [
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
  { label: "AI Tutor", href: "#ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { session } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
        <Link to="/"><CoretexLogo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Link to="/app" className="inline-flex h-10 items-center rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">Open app</Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-foreground hover:bg-secondary transition">Sign In</Link>
              <Link to="/signup" className="inline-flex h-10 items-center rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}