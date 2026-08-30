import type React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export function AuthShell({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return (
    <div className="grain min-h-[100dvh] bg-background">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1500px] md:grid-cols-[.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-foreground p-10 text-background md:flex md:flex-col md:justify-between lg:p-14">
          <div className="absolute -right-28 top-28 h-72 w-72 rounded-full border-[38px] border-secondary/25" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/90" />
          <Link href="/landing" className="relative flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span><span className="font-display text-xl">smartyt<span className="text-secondary">.</span></span></Link>
          <div className="relative max-w-md"><p className="font-mono text-xs uppercase tracking-[.2em] text-secondary">A calmer way to create</p><p className="mt-5 font-display text-5xl leading-[1.02]">Make room for the good ideas.</p><p className="mt-5 max-w-sm leading-7 text-background/65">A focused workspace for the messy, exciting bit between “what if…” and publish.</p></div>
          <p className="relative text-xs text-background/45">smartyt / creator workspace</p>
        </aside>
        <main className="flex flex-col px-5 py-6 md:px-12 md:py-10 lg:px-24">
          <div className="flex items-center justify-between"><Link href="/landing" className="flex items-center gap-2 md:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span><span className="font-display text-lg">smartyt<span className="text-primary">.</span></span></Link><Link href="/landing" className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Back to site</Link></div>
          <div className="my-auto w-full max-w-md py-14"><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">{eyebrow}</p><h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{title}</h1><p className="mt-4 leading-7 text-muted-foreground">{description}</p><div className="mt-9">{children}</div></div>
        </main>
      </div>
    </div>
  );
}