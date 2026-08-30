"use client";

import Link from "next/link";
import { ArrowRight, Check, Clapperboard, Gauge, Lightbulb, Play, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const workflow = [
  { number: "01", title: "Find the angle", body: "Turn half-formed thoughts into a point of view people want to click.", icon: Lightbulb },
  { number: "02", title: "Make it watchable", body: "Build titles, hooks and scripts around the moment your audience cares about.", icon: Clapperboard },
  { number: "03", title: "Ship with signal", body: "Polish the details, publish on your terms, then learn from the next upload.", icon: Gauge },
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/landing" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="h-4 w-4" /></span>
          <span className="font-display text-xl font-semibold tracking-tight">smartyt<span className="text-primary">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#workflow" className="transition-colors hover:text-foreground">Workflow</a>
          <a href="#why" className="transition-colors hover:text-foreground">Why Smartyt</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
          <Button size="sm" asChild><Link href="/signup">Start creating <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.05fr_.95fr] md:px-8 md:pb-32 md:pt-20">
          <div className="relative z-10 animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Built for the next upload
            </div>
            <h1 className="max-w-3xl font-display text-[3.7rem] font-semibold leading-[.95] tracking-[-.055em] md:text-[6.8rem]">
              Make the idea<br /><em className="font-normal text-primary">impossible</em> to skip.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
              Smartyt gives your YouTube ideas a clear angle, a sharper hook and a path from blank page to publish button.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild><Link href="/signup">Build your next video <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button variant="outline" size="lg" asChild><a href="#workflow"><Play className="h-4 w-4 fill-current" /> See the workflow</a></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              {["Ideas with an angle", "SEO that reads human", "One calm workspace"].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" />{item}</span>)}
            </div>
          </div>

          <div className="relative min-h-[450px] animate-rise-in [animation-delay:120ms] md:min-h-[540px]">
            <div className="absolute right-0 top-8 h-[390px] w-[90%] rotate-2 rounded-[2rem] bg-accent p-5 shadow-2xl shadow-accent/20 md:h-[470px]">
              <div className="flex items-center justify-between text-accent-foreground/70"><span className="font-mono text-[10px] uppercase tracking-[.2em]">smartyt / idea lab</span><span className="h-2 w-2 rounded-full bg-secondary" /></div>
              <div className="mt-10 rounded-2xl bg-background/95 p-5 shadow-lg md:p-7">
                <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-primary">Video brief</span><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold">READY TO BUILD</span></div>
                <h3 className="mt-5 font-display text-2xl leading-tight md:text-3xl">Why your morning routine is making you tired</h3>
                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-border bg-muted/60 p-3"><span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">the hook</span><p className="mt-1 text-sm font-medium">The first hour of your day might be the problem.</p></div>
                  <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-primary p-3 text-primary-foreground"><span className="font-mono text-[9px] uppercase tracking-widest opacity-70">click score</span><p className="mt-2 text-2xl font-bold">8.7</p></div><div className="rounded-xl bg-secondary p-3"><span className="font-mono text-[9px] uppercase tracking-widest opacity-60">search fit</span><p className="mt-2 text-2xl font-bold">High</p></div></div>
                </div>
              </div>
              <div className="absolute -bottom-7 -left-9 w-44 -rotate-6 rounded-2xl border border-border bg-card p-4 shadow-xl md:-left-16"><WandSparkles className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold leading-5">One strong idea beats ten forgettable ones.</p></div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-y border-border bg-card/55 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-[.7fr_1.3fr] md:items-end"><div><span className="font-mono text-xs uppercase tracking-[.2em] text-primary">The creator loop</span><h2 className="mt-4 max-w-lg font-display text-4xl leading-tight md:text-6xl">Less tab juggling.<br /><span className="text-accent">More making.</span></h2></div><p className="max-w-md text-muted-foreground md:justify-self-end">Every Smartyt tool points toward the same thing: a video that sounds like you and gives your audience a reason to stay.</p></div>
            <div className="mt-16 grid gap-5 md:grid-cols-3">{workflow.map(({ number, title, body, icon: Icon }) => <article key={number} className="group border-t-2 border-border pt-5 transition-transform hover:-translate-y-1"><div className="flex items-center justify-between"><span className="font-mono text-xs text-primary">{number}</span><Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" /></div><h3 className="mt-12 font-display text-2xl">{title}</h3><p className="mt-3 max-w-xs leading-7 text-muted-foreground">{body}</p></article>)}</div>
          </div>
        </section>

        <section id="why" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-32">
          <div><span className="font-mono text-xs uppercase tracking-[.2em] text-primary">A better blank page</span><h2 className="mt-4 max-w-lg font-display text-4xl leading-tight md:text-6xl">Your process,<br />with a little <em className="font-normal text-primary">momentum.</em></h2></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-secondary p-6"><p className="font-mono text-xs uppercase tracking-widest opacity-60">01 / clarity</p><p className="mt-16 text-lg font-semibold leading-7">Know what the video is really about before you hit record.</p></div><div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:translate-y-10"><p className="font-mono text-xs uppercase tracking-widest opacity-70">02 / confidence</p><p className="mt-16 text-lg font-semibold leading-7">Stop second-guessing the title, hook and thumbnail after the fact.</p></div></div>
        </section>

        <section className="mx-5 mb-8 rounded-[2rem] bg-foreground px-6 py-16 text-background md:mx-8 md:px-16 md:py-20"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div><span className="font-mono text-xs uppercase tracking-[.2em] text-secondary">Your next upload starts here</span><h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-6xl">Bring the rough idea.<br /><span className="text-secondary">Leave with a plan.</span></h2></div><Button variant="secondary" size="lg" asChild><Link href="/signup">Start for free <ArrowRight className="h-4 w-4" /></Link></Button></div></section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8"><span className="font-display text-base font-semibold text-foreground">smartyt<span className="text-primary">.</span></span><span>Make the next one count.</span></footer>
    </div>
  );
}