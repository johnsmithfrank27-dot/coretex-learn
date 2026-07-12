import { CoretexLogo } from "@/components/coretex-logo";
import { Twitter, Github, Linkedin, Youtube } from "lucide-react";

const cols = [
  { title: "Company", items: ["About", "Careers", "Blog", "Press"] },
  { title: "Resources", items: ["Docs", "Help Center", "Guides", "Changelog"] },
  { title: "Community", items: ["Discord", "Study Groups", "Events", "Ambassadors"] },
  { title: "Support", items: ["Contact", "Status", "Privacy", "Terms"] },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-6">
          <div className="md:col-span-2">
            <CoretexLogo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">The AI-native learning platform for the next generation of students.</p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Github, Linkedin, Youtube].map((I, i) => (
                <a key={i} href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-secondary transition"><I className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold mb-3">{c.title}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {c.items.map((i) => <li key={i}><a href="#" className="hover:text-foreground transition">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>© 2026 Coretex, Inc. All rights reserved.</div>
          <div className="flex gap-6"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
        </div>
      </div>
    </footer>
  );
}