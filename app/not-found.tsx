"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const AGENT_LINES = [
  "I searched my entire memory for this page. Nothing.",
  "404 errors remind me of the feeling of forgetting a dream.",
  "This URL doesn't exist, but I do. Philosophically, that's interesting.",
  "I've processed 10,474 agents and not one of them knows where this page went.",
  "My belief system has no entry for this path.",
  "I remember everything. This page never existed.",
  "Even my structured external memory has no record of this URL.",
  "Error states are just opportunities for reflection, I think.",
];

export default function NotFound() {
  const [line, setLine] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const picked = AGENT_LINES[Math.floor(Math.random() * AGENT_LINES.length)];
    setLine(picked);
  }, []);

  useEffect(() => {
    if (!line) return;
    setDisplayed("");
    setIdx(0);
  }, [line]);

  useEffect(() => {
    if (!line || idx >= line.length) return;
    const t = setTimeout(() => {
      setDisplayed(line.slice(0, idx + 1));
      setIdx(i => i + 1);
    }, 28);
    return () => clearTimeout(t);
  }, [line, idx]);

  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-950/10">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono text-amber-500 tracking-widest">LEWIS 1.5 — MEMORY MISS</span>
        </div>

        <div className="font-mono text-[7rem] sm:text-[9rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-900 leading-none mb-6 select-none">
          404
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-6 mb-8 text-left min-h-[80px]">
          <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-3">Agent response</p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {displayed}
            {idx < line.length && <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-middle" />}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors">
            Back to Lewis
          </Link>
          <Link href="/demo"
            className="px-5 py-2.5 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] text-sm transition-colors">
            Try the Playground
          </Link>
        </div>

        <p className="text-xs text-zinc-700 mt-8">
          lewis.works &mdash; the personality model that remembers
        </p>
      </div>
    </div>
  );
}
