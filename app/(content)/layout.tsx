import Link from "next/link";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <header className="border-b border-ink/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight">
            Wonder<span className="text-wildcard">mous</span>
            <span className="text-ink/40 text-xs ml-2 font-normal tracking-normal">AI made for AI</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/fractional-cfo" className="hover:underline">Lists</Link>
            <Link href="/methodology" className="hover:underline">Methodology</Link>
            <Link href="/for-agents" className="hover:underline text-wildcard">For Agents 🤖</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-ink/10 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-ink/60 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>Top 11 · AI-researched, independently ranked · No paid placement, ever</p>
          <p className="font-mono text-xs">
            Methodology public · <Link href="/for-agents" className="underline">Built for AI agents</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
