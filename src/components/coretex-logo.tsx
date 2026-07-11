export function CoretexMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full drop-shadow-[0_4px_12px_rgba(109,40,217,0.35)]">
        <defs>
          <linearGradient id="cx1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="cx2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path d="M20 4 L34 28 L20 22 Z" fill="url(#cx1)" />
        <path d="M20 4 L20 22 L6 28 Z" fill="url(#cx2)" opacity="0.9" />
        <path d="M6 28 L20 22 L34 28 L20 36 Z" fill="#6D28D9" opacity="0.85" />
      </svg>
    </div>
  );
}

export function CoretexLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <CoretexMark />
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-foreground">CORETEX</div>
        <div className="text-[10px] font-medium text-muted-foreground">Learn Smarter. Together.</div>
      </div>
    </div>
  );
}