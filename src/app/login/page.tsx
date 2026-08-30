"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Mail, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const { error: authError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    toast.success("Welcome back.");
    router.push("/dashboard");
    router.refresh();
  }

  return <AuthShell eyebrow="Welcome back" title="Pick up where the good idea left off." description="Sign in to keep your ideas, drafts and publishing plan moving.">
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
      <label className="block text-sm font-semibold">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@creator.com" className="pl-10" /></div></label>
      <label className="block text-sm font-semibold">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="pl-10" /></div></label>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing you in</> : <>Continue to workspace <ArrowRight className="h-4 w-4" /></>}</Button>
      <p className="text-center text-sm text-muted-foreground">New to Smartyt? <Link href="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p>
    </form>
  </AuthShell>;
}