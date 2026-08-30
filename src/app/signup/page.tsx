"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Mail, LockKeyhole, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const { data, error: authError } = await getSupabaseBrowserClient().auth.signUp({ email, password, options: { data: { creatorName: name } } });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (!data.session) { toast.success("Check your inbox to confirm your email, then come back to sign in."); router.push("/login"); return; }
    toast.success("Your workspace is ready.");
    router.push("/onboarding");
    router.refresh();
  }

  return <AuthShell eyebrow="Start with an idea" title="Your next video has somewhere to go." description="Create a focused workspace for the ideas you actually want to make. No busywork, just a clearer path to publish.">
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
      <label className="block text-sm font-semibold">Creator name<div className="relative mt-2"><UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" className="pl-10" /></div></label>
      <label className="block text-sm font-semibold">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@creator.com" className="pl-10" /></div></label>
      <label className="block text-sm font-semibold">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-10" /></div></label>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your space</> : <>Create workspace <ArrowRight className="h-4 w-4" /></>}</Button>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </form>
  </AuthShell>;
}