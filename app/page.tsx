"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Ambient background glow — amber, very subtle */}
      <div
        className="ambient pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(245,158,11,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full">

        {/* Eyebrow */}
        <p className="fade-1 text-[11px] tracking-[0.4em] text-amber-500/70 uppercase mb-8 font-mono">
          2026
        </p>

        {/* The name */}
        <h1 className="fade-2 font-serif text-[clamp(72px,16vw,140px)] leading-none text-white tracking-tight select-none">
          Lewis
        </h1>

        {/* Divider */}
        <div className="fade-3 mx-auto mt-8 mb-8 w-12 h-px bg-amber-500/30" />

        {/* Notify */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="fade-4 flex flex-col items-center gap-3">
            <div className={`flex w-full max-w-sm rounded-lg border transition-all duration-200 overflow-hidden ${
              focused ? "border-amber-500/50" : "border-zinc-800"
            } bg-zinc-950`}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 text-sm font-semibold text-black bg-amber-500 hover:bg-amber-400 transition-colors shrink-0"
              >
                Notify me
              </button>
            </div>
            <p className="text-[11px] text-zinc-700 tracking-wide">
              No details. Just a notification when it&apos;s ready.
            </p>
          </form>
        ) : (
          <div className="fade-4 space-y-1">
            <p className="text-sm text-amber-400 font-medium">Noted.</p>
            <p className="text-xs text-zinc-600">You&apos;ll hear from us when it&apos;s time.</p>
          </div>
        )}
      </div>

      {/* Bottom attribution — tiny */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <a
          href="https://swarmgram.com"
          className="text-[10px] tracking-[0.25em] text-zinc-800 hover:text-zinc-600 uppercase transition-colors"
        >
          A Swarmgram project
        </a>
      </div>
    </main>
  );
}
