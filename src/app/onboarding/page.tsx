"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleUserRound, Clapperboard, Target, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = [
  { id: "profile", title: "About you", icon: CircleUserRound, kicker: "First, your point of view" },
  { id: "channel", title: "Your channel", icon: Clapperboard, kicker: "Then, who you make for" },
  { id: "goals", title: "Your direction", icon: Target, kicker: "Finally, what good looks like" },
];
const goalOptions = ["More views", "More subscribers", "Better SEO", "Better consistency", "Better CTR", "Better content ideas"];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({ creatorName: "", mainLanguage: "en", targetAudience: "", contentFormat: "both", mainTopics: [] as string[], goals: [] as string[] });
  const [topicInput, setTopicInput] = useState("");
  const [saving, setSaving] = useState(false);

  function addTopic() {
    const topic = topicInput.trim();
    if (topic && !profile.mainTopics.includes(topic)) setProfile((current) => ({ ...current, mainTopics: [...current.mainTopics, topic] }));
    setTopicInput("");
  }
  function toggleGoal(goal: string) {
    setProfile((current) => ({ ...current, goals: current.goals.includes(goal) ? current.goals.filter((item) => item !== goal) : [...current.goals, goal] }));
  }
  async function next() {
    if (currentStep < steps.length - 1) setCurrentStep((step) => step + 1);
    else {
      setSaving(true);
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(profile),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not save your profile");
        toast.success("Your Smartyt workspace is ready.");
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save your profile");
      } finally {
        setSaving(false);
      }
    }
  }

  const step = steps[currentStep];
  return (
    <div className="grain min-h-[100dvh] bg-background px-5 py-6 md:px-10 md:py-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><CheckCircle2 className="h-5 w-5" /></span><span className="font-display text-xl font-semibold">smartyt<span className="text-primary">.</span></span></div><span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Setup / {String(currentStep + 1).padStart(2, "0")} of 03</span></header>
      <main className="mx-auto grid max-w-6xl gap-10 py-12 md:grid-cols-[.72fr_1.28fr] md:items-center md:py-20">
        <div className="max-w-sm"><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Let&apos;s make it yours</p><h1 className="mt-4 font-display text-5xl leading-[1.02] md:text-6xl">{step.kicker}.</h1><p className="mt-5 leading-7 text-muted-foreground">A few useful details help Smartyt make better suggestions. You can always change these later.</p><div className="mt-10 flex gap-2">{steps.map((item, index) => <div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= currentStep ? "bg-primary" : "bg-border"}`} />)}</div></div>
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_20px_70px_hsl(var(--foreground)/.07)] md:p-10">
          <div className="mb-8 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[.16em] text-muted-foreground">Step {currentStep + 1}</p><h2 className="mt-2 font-display text-3xl">{step.title}</h2></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary"><step.icon className="h-5 w-5" /></div></div>
          {currentStep === 0 && <div className="space-y-6"><label className="block text-sm font-semibold">Creator name<Input value={profile.creatorName} onChange={(e) => setProfile({ ...profile, creatorName: e.target.value })} placeholder="How should we call you?" className="mt-2" /></label><label className="block text-sm font-semibold">Main language<select value={profile.mainLanguage} onChange={(e) => setProfile({ ...profile, mainLanguage: e.target.value })} className="mt-2 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary"><option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option></select></label></div>}
          {currentStep === 1 && <div className="space-y-6"><label className="block text-sm font-semibold">Who are you making videos for?<Input value={profile.targetAudience} onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })} placeholder="Tech beginners, busy parents, indie founders..." className="mt-2" /></label><div><p className="text-sm font-semibold">What do you make?</p><div className="mt-2 grid grid-cols-3 gap-2">{[["long_form", "Long form"], ["shorts", "Shorts"], ["both", "A mix"]].map(([value, label]) => <button type="button" key={value} onClick={() => setProfile({ ...profile, contentFormat: value })} className={`rounded-xl border p-3 text-left text-sm font-semibold transition-smooth ${profile.contentFormat === value ? "border-primary bg-primary/8 text-primary" : "border-border hover:border-primary/40"}`}>{label}<span className="mt-1 block text-xs font-normal text-muted-foreground">{value === "shorts" ? "Quick hits" : value === "long_form" ? "Deep dives" : "Best of both"}</span></button>)}</div></div><div><p className="text-sm font-semibold">Your main topics</p><div className="mt-2 flex gap-2"><Input value={topicInput} onChange={(e) => setTopicInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }} placeholder="Add a topic" /><Button type="button" variant="secondary" onClick={addTopic}>Add</Button></div><div className="mt-3 flex flex-wrap gap-2">{profile.mainTopics.map((topic) => <span key={topic} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">{topic}<button type="button" onClick={() => setProfile((current) => ({ ...current, mainTopics: current.mainTopics.filter((item) => item !== topic) }))} aria-label={`Remove ${topic}`}><X className="h-3 w-3" /></button></span>)}</div></div></div>}
          {currentStep === 2 && <div><p className="text-sm font-semibold">Pick the outcomes that matter right now.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{goalOptions.map((goal) => { const selected = profile.goals.includes(goal); return <button type="button" key={goal} onClick={() => toggleGoal(goal)} className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-smooth ${selected ? "border-primary bg-primary/8 text-primary" : "border-border hover:border-primary/40"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{selected && <Check className="h-3 w-3" />}</span>{goal}</button>; })}</div></div>}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-5"><Button variant="ghost" onClick={() => setCurrentStep((value) => Math.max(0, value - 1))} disabled={currentStep === 0}><ArrowLeft className="h-4 w-4" /> Back</Button><Button onClick={next} disabled={saving}>{currentStep === steps.length - 1 ? "Enter Smartyt" : "Continue"}<ArrowRight className="h-4 w-4" /></Button></div>
        </section>
      </main>
    </div>
  );
}