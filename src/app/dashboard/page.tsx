"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, CalendarDays, Clapperboard, FileText, Lightbulb, Plus, RefreshCw, Sparkles, Youtube } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardData = {
  channels?: Array<{ id: string; channelTitle?: string; subscriberCount?: number | string }>;
  recentDrafts?: Array<{ id: string; title?: string | null; status: string; updatedAt: string }>;
  recentIdeas?: Array<{ id: string; titleConcept?: string | null; hook?: string | null; createdAt: string }>;
  usage?: { aiGenerationsUsed?: number; keywordSearchesUsed?: number; uploadsUsed?: number } | null;
  subscription?: { plan?: string } | null;
};

const formatNumber = (value: number | string | undefined) => value ? Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value)) : "—";
const statusVariant = (status: string) => status === "published" ? "default" : status === "ready" ? "secondary" : "outline";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    setError("");
    try {
      const response = await fetch("/api/dashboard", { credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not load your workspace");
      setData(result.data);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load your workspace"); }
    finally { setLoading(false); setRefreshing(false); }
  }
  useEffect(() => { loadDashboard(); }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><RefreshCw className="h-6 w-6 text-primary" /></div><h1 className="mt-5 font-display text-3xl">Your studio is taking a beat.</h1><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-6" onClick={() => { setRefreshing(true); loadDashboard(); }}>Try again <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></Button></div>;

  const channels = data?.channels ?? [];
  const drafts = data?.recentDrafts ?? [];
  const ideas = data?.recentIdeas ?? [];
  const usage = data?.usage;
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">Monday, your studio is open</p><h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">Good to see you.</h1><p className="mt-3 text-muted-foreground">What deserves your attention today?</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setRefreshing(true); loadDashboard(); }} disabled={refreshing}><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh</Button><Button asChild><Link href="/create"><Plus className="h-4 w-4" /> New video</Link></Button></div></div>

      {channels.length === 0 && <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground"><CardContent className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8"><div className="absolute -right-5 -top-16 h-48 w-48 rounded-full border-[24px] border-primary-foreground/10" /><div className="relative"><div className="flex items-center gap-2 text-sm font-semibold"><Youtube className="h-4 w-4" /> Connect your channel</div><h2 className="mt-3 font-display text-3xl">Give your ideas a home.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/75">Connect YouTube to see your real publishing rhythm and make every recommendation more useful.</p></div><Button variant="secondary" asChild><Link href="/api/youtube/connect">Connect YouTube <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>}

      <div className="grid gap-4 sm:grid-cols-3"><Metric icon={Clapperboard} label="Active channel" value={channels[0]?.channelTitle || "Not connected"} detail={channels[0] ? `${formatNumber(channels[0].subscriberCount)} subscribers` : "Connect to unlock insights"} accent="bg-secondary" /><Metric icon={Sparkles} label="AI generations" value={String(usage?.aiGenerationsUsed ?? 0)} detail="This month" accent="bg-primary text-primary-foreground" /><Metric icon={BarChart3} label="Publishing plan" value={drafts.length ? `${drafts.length} drafts` : "Start fresh"} detail={drafts.length ? "Recently active" : "Your next upload is waiting"} accent="bg-accent text-accent-foreground" /></div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <Card><CardContent className="p-6 md:p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">Your workspace</p><h2 className="mt-2 font-display text-2xl">Keep the momentum</h2></div><Button variant="ghost" size="sm" asChild><Link href="/videos">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button></div>{drafts.length ? <div className="mt-6 divide-y divide-border">{drafts.map((draft) => <Link href="/videos" key={draft.id} className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted"><Clapperboard className="h-4 w-4 text-primary" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold group-hover:text-primary">{draft.title || "Untitled video"}</p><p className="mt-1 text-xs text-muted-foreground">Updated {new Date(draft.updatedAt).toLocaleDateString()}</p></div></div><Badge variant={statusVariant(draft.status) as "default" | "secondary" | "outline"}>{draft.status}</Badge></Link>)}</div> : <EmptyBlock icon={FileText} title="Your first draft is one idea away." body="Give the next good thought a title and let it become something real." action="Start a draft" href="/create" />}</CardContent></Card>
        <Card className="bg-foreground text-background"><CardContent className="p-6 md:p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">Idea shelf</p><h2 className="mt-2 font-display text-2xl">Worth exploring</h2></div><Lightbulb className="h-5 w-5 text-secondary" /></div>{ideas.length ? <div className="mt-6 space-y-4">{ideas.slice(0, 3).map((idea) => <div key={idea.id} className="border-t border-background/15 pt-4"><p className="text-sm font-semibold leading-5">{idea.titleConcept || "Untitled idea"}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-background/55">{idea.hook || "Shape the hook when you are ready."}</p></div>)}</div> : <div className="mt-8 rounded-2xl border border-background/15 p-4"><p className="text-sm font-semibold">No ideas on the shelf yet.</p><p className="mt-2 text-xs leading-5 text-background/55">The best starting point is usually a question your audience keeps asking.</p><Button variant="secondary" size="sm" className="mt-5" asChild><Link href="/create">Add an idea <ArrowRight className="h-3.5 w-3.5" /></Link></Button></div>}</CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><QuickLink icon={Lightbulb} title="Capture an idea" text="Turn a spark into a video brief." href="/create" /><QuickLink icon={CalendarDays} title="Plan the week" text="Keep your next upload visible." href="/videos" /><QuickLink icon={BarChart3} title="Read the signal" text="Review your latest drafts and uploads." href="/videos" /></div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, accent }: { icon: typeof Sparkles; label: string; value: string; detail: string; accent: string }) {
  return <Card><CardContent className="p-5"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></div><p className="mt-5 text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}
function EmptyBlock({ icon: Icon, title, body, action, href }: { icon: typeof FileText; title: string; body: string; action: string; href: string }) {
  return <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/35 p-6"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 font-semibold">{title}</p><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p><Button variant="outline" size="sm" className="mt-5" asChild><Link href={href}>{action} <ArrowRight className="h-3.5 w-3.5" /></Link></Button></div>;
}
function QuickLink({ icon: Icon, title, text, href }: { icon: typeof Lightbulb; title: string; text: string; href: string }) {
  return <Link href={href} className="group rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-primary" /><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><p className="mt-8 font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></Link>;
}
function DashboardSkeleton() {
  return <div className="space-y-8"><div><Skeleton className="h-3 w-32" /><Skeleton className="mt-4 h-12 w-72" /><Skeleton className="mt-3 h-4 w-52" /></div><Skeleton className="h-40 w-full rounded-2xl" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}</div><div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><Skeleton className="h-96 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div></div>;
}