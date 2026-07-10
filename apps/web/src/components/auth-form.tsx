"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }
    window.location.assign("/");
  }

  const isSignup = mode === "signup";
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">Orbit</Link>
        <h1>{isSignup ? "Build your Orbit" : "Welcome back"}</h1>
        <p>{isSignup ? "Create an account to publish, like, and save your feed." : "Log in to keep your feed activity connected to your account."}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignup ? <label>Name<input name="name" autoComplete="name" required maxLength={60} /></label> : null}
          {isSignup ? <label>Handle<input name="handle" autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" placeholder="orbit_builder" /></label> : null}
          <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} /></label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Working..." : isSignup ? "Create account" : "Log in"}</button>
        </form>
        {!isSignup ? <p className="auth-switch">New to Orbit? <Link href="/signup">Create an account</Link></p> : <p className="auth-switch">Already a member? <Link href="/login">Log in</Link></p>}
        {!isSignup ? <p className="demo-note">Demo account: <strong>hideo@orbit.local</strong> / <strong>orbit-demo-2026</strong></p> : null}
      </section>
    </main>
  );
}
