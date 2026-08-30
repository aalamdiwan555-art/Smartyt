"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clapperboard, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title: title || null, description: description || null, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not save draft");
      setSaved(true); toast.success("Draft saved to your workspace.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save draft"); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-5xl pb-12"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link><div className="mt-8 grid gap-8 md:grid-cols-[.72fr_1.28fr] md:items-start"><div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary"><Sparkles className="h-5 w-5" /></div><p className="mt-7 font-mono text-xs uppercase tracking-[.18em] text-primary">New video</p><h1 className="mt-3 font-display text-5xl leading-[1.02]">Give the idea<br /><em className="font-normal text-primary">a shape.</em></h1><p className="mt-5 max-w-sm leading-7 text-muted-foreground">Start with the part you know. Smartyt keeps the rest of the brief close while you find the angle.</p><div className="mt-10 space-y-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground"><Check className="h-3 w-3" /></span> Save a working title</p><p className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground"><Check className="h-3 w-3" /></span> Add context for later</p><p className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground"><Check className="h-3 w-3" /></span> Come back when it is ready</p></div></div><Card><CardContent className="p-6 md:p-8"><div className="flex items-center gap-3 border-b border-border pb-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Clapperboard className="h-5 w-5 text-primary" /></div><div><p className="font-semibold">Video brief</p><p className="text-sm text-muted-foreground">A private draft, until you say otherwise.</p></div></div><form onSubmit={submit} className="mt-7 space-y-6"><label className="block text-sm font-semibold">Working title<span className="ml-1 text-primary">*</span><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The idea in one clear sentence" className="mt-2 h-12 text-base" /></label><label className="block text-sm font-semibold">What is this video about?<Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A rough thought is enough. What do you want your audience to understand, feel or do?" className="mt-2 min-h-36 resize-none leading-6" /></label><label className="block text-sm font-semibold">Keywords <span className="font-normal text-muted-foreground">(optional)</span><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separate keywords with commas" className="mt-2" /></label><div className="flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center"><p className="text-xs text-muted-foreground">{saved ? "Saved. Keep shaping it when you are ready." : "You can edit every detail later."}</p><Button type="submit" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving</> : <>Save draft <ArrowRight className="h-4 w-4" /></>}</Button></div></form></CardContent></Card></div></div>;
}