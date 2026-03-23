"use client";

import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const links = [
    { href: "#benchmarks", label: "Benchmarks" },
    { href: "#memory", label: "Memory" },
    { href: "#the-swarm", label: "The Swarm" },
    { href: "#products", label: "Products" },
    { href: "/lewsearch", label: "Lewsearch", color: "text-emerald-400/80" },
    { href: "/lewnpc", label: "LewNPC", color: "text-violet-400/80" },
    { href: "/validation", label: "vs. Pew", color: "text-zinc-400/80" },
    { href: "/case-study", label: "Case Study", color: "text-indigo-400/80" },
    { href: "/demo", label: "Demo", color: "text-amber-500/80" },
  ];

  return (
    <nav ref={ref} className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-black/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="text-[15px] font-serif text-white tracking-tight">Lewis</a>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6 text-[13px] text-zinc-500">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`hover:text-white transition-colors ${l.color || ""}`}>{l.label}</a>
          ))}
          <a href="#access" className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors">
            Request Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden border-t border-white/[0.04] bg-black/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-[14px] transition-colors hover:text-white ${l.color || "text-zinc-400"}`}>
              {l.label}
            </a>
          ))}
          <a href="#access" onClick={() => setOpen(false)}
            className="mt-1 px-4 py-2.5 rounded-lg bg-amber-500 text-black font-semibold text-[14px] text-center hover:bg-amber-400 transition-colors">
            Request Access
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center pt-20 pb-16">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="fade-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-500 mb-8 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Lewis 1.5 live &middot; March 2026
        </div>

        <h1 className="fade-2 font-serif leading-[1.05] tracking-tight mb-6">
          <span className="block text-zinc-500 italic" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            The only personality model
          </span>
          <span className="block text-white" style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}>
            that remembers.
          </span>
        </h1>

        <p className="fade-3 text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10" style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)" }}>
          Frontier models are stateless &mdash; every conversation starts blank. Lewis is trained on
          thousands of AI agents that maintained persistent memories, formed opinions, and evolved
          identities over 30 days. The result: personality that compounds over time, at 1/125th the cost.
        </p>

        <div className="fade-4 flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <a href="#access" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[15px] font-semibold transition-all hover:scale-[1.02]">
            Request API Access
          </a>
          <a href="/demo" className="px-6 py-3 rounded-xl border border-amber-500/30 text-amber-400 text-[15px] hover:border-amber-500/50 hover:bg-amber-950/10 transition-all">
            Try the Playground
          </a>
        </div>

        <div className="fade-5 inline-grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-white">10,474</div>
            <div className="text-zinc-600 text-xs mt-0.5">source agents</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">5/6</div>
            <div className="text-zinc-600 text-xs mt-0.5">axes beat or match Opus</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-500">$0</div>
            <div className="text-zinc-600 text-xs mt-0.5">memory cost</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-500">125x</div>
            <div className="text-zinc-600 text-xs mt-0.5">cheaper than Opus</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOUNDER VIDEO
───────────────────────────────────────────────────────── */
function FounderVideo() {
  return (
    <section className="py-16 px-6 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="reveal text-center mb-8">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">From the founder</p>
          <h2 className="font-serif text-white leading-tight" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
            Why persistent memory changes everything.
          </h2>
        </div>
        <div className="reveal rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-950 aspect-video">
          <iframe
            src="https://player.vimeo.com/video/1175626793?badge=0&autopause=0&player_id=0&app_id=58479&transparent=0&title=0&byline=0&portrait=0&pip=0&collections=0&share=0&like=0&watchlater=0&speed=0"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            title="Founder Video"
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   HEAD-TO-HEAD COMPARISON TABLE
───────────────────────────────────────────────────────── */
function ComparisonTable() {
  const rows = [
    { label: "Memory Architecture", lewis: "Structured external memory (Supabase)", opus: "Context window stuffing", sonnet: "Context window stuffing" },
    { label: "Personality Source", lewis: "Living agent behavioral data", opus: "Internet text + RLHF", sonnet: "Internet text + RLHF" },
    { label: "Cost per response", lewis: "<$0.002 (self-hosted)", opus: "$0.25", sonnet: "$0.05" },
    { label: "Memory cost (100 convos)", lewis: "$0.00", opus: "$24.19", sonnet: "~$5.00" },
    { label: "Character persistence", lewis: "100% (adversarial tested)", opus: "88%", sonnet: "92%" },
    { label: "AI tells per response", lewis: "0.08 avg", opus: "0.27 avg", sonnet: "0.13 avg" },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Head to head</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Lewis vs. frontier models.
          </h2>
          <p className="text-zinc-500 max-w-xl">
            Opus and Sonnet are brilliant general-purpose models. Lewis is purpose-built
            for one thing: persistent, distinct personalities that evolve over time.
          </p>
        </div>

        <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 overflow-hidden">
          <div className="grid grid-cols-4 text-xs font-mono tracking-wider uppercase border-b border-white/[0.06]">
            <div className="p-4 text-zinc-600" />
            <div className="p-4 text-center text-amber-500 border-l border-white/[0.06] bg-amber-950/10">Lewis 1.5</div>
            <div className="p-4 text-center text-zinc-500 border-l border-white/[0.06]">Opus</div>
            <div className="p-4 text-center text-zinc-500 border-l border-white/[0.06]">Sonnet</div>
          </div>

          {rows.map(({ label, lewis, opus, sonnet }, i) => (
            <div key={label} className={`grid grid-cols-4 text-sm ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
              <div className="p-4 text-zinc-500 font-medium">{label}</div>
              <div className="p-4 border-l border-white/[0.06] text-amber-300/90 bg-amber-950/5">{lewis}</div>
              <div className="p-4 border-l border-white/[0.06] text-zinc-500">{opus}</div>
              <div className="p-4 border-l border-white/[0.06] text-zinc-500">{sonnet}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PERSISTENT MEMORY — Real Benchmark Data
───────────────────────────────────────────────────────── */
function PersistentMemory() {
  const trajectory = [
    { turn: 1, lewisTokens: 586, opusTokens: 92, lewisCost: 0, opusCost: 0.0014 },
    { turn: 10, lewisTokens: 948, opusTokens: 2763, lewisCost: 0, opusCost: 0.20 },
    { turn: 25, lewisTokens: 980, opusTokens: 5500, lewisCost: 0, opusCost: 1.20 },
    { turn: 50, lewisTokens: 1049, opusTokens: 16331, lewisCost: 0, opusCost: 6.01 },
    { turn: 75, lewisTokens: 996, opusTokens: 22189, lewisCost: 0, opusCost: 11.80 },
    { turn: 100, lewisTokens: 1001, opusTokens: 33035, lewisCost: 0, opusCost: 24.19 },
  ];

  const recallData = [
    { checkpoint: "Turn 10", lewis: 100, opus: 100 },
    { checkpoint: "Turn 25", lewis: 80, opus: 100 },
    { checkpoint: "Turn 50", lewis: 86, opus: 100 },
    { checkpoint: "Turn 75", lewis: 86, opus: 100 },
    { checkpoint: "Turn 100", lewis: 100, opus: 100 },
  ];

  return (
    <section id="memory" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">The differentiator</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Persistent memory at zero marginal cost.
          </h2>
          <p className="text-zinc-500 max-w-2xl">
            Frontier models stuff the context window with conversation history. It works&mdash;until the cost
            scales to $242K for 10,000 agents. Lewis uses structured external memory. The prompt stays flat.
            The cost stays zero. Real benchmark data from 100 conversations with 7 planted facts.
          </p>
        </div>

        {/* Token/Cost Growth Chart */}
        <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Token Growth &amp; Cost per Turn</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded-full bg-amber-500" />
                <span className="text-[10px] text-zinc-500">Lewis 1.5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded-full bg-zinc-600" />
                <span className="text-[10px] text-zinc-500">Opus</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[500px]">
              {trajectory.map(({ turn, lewisTokens, opusTokens, opusCost }) => (
                <div key={turn} className="text-center">
                  <div className="relative h-40 flex items-end justify-center gap-1.5 mb-2">
                    <div
                      className="w-6 rounded-t-sm bg-amber-500 transition-all"
                      style={{ height: `${Math.max((lewisTokens / 35000) * 160, 4)}px` }}
                    />
                    <div
                      className="w-6 rounded-t-sm bg-zinc-600 transition-all"
                      style={{ height: `${Math.max((opusTokens / 35000) * 160, 4)}px` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600">Turn {turn}</div>
                  <div className="text-[10px] font-mono text-amber-500">$0</div>
                  <div className="text-[10px] font-mono text-zinc-500">${opusCost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-700 mt-6 text-center">
            Lewis prompt: ~1,000 tokens (flat). Opus prompt: 92 &rarr; 33,035 tokens. Total Opus cost: $24.19 for one agent.
          </p>
        </div>

        {/* Recall Rate Comparison */}
        <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-8 mb-8">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-6">Fact Recall Rate (7 planted facts)</p>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-3 min-w-[400px]">
              {recallData.map(({ checkpoint, lewis, opus }) => (
                <div key={checkpoint} className="text-center">
                  <div className="flex items-end justify-center gap-1.5 h-24 mb-2">
                    <div className="w-7 rounded-t-sm bg-amber-500" style={{ height: `${lewis * 0.96}px` }} />
                    <div className="w-7 rounded-t-sm bg-zinc-600" style={{ height: `${opus * 0.96}px` }} />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600">{checkpoint}</div>
                  <div className="text-[10px] font-mono text-amber-500">{lewis}%</div>
                  <div className="text-[10px] font-mono text-zinc-500">{opus}%</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-700 mt-4 text-center">
            Opus maintains 100% recall but at exponentially growing cost. Lewis maintains 80&ndash;100% recall at $0.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="reveal rounded-xl border border-amber-500/20 bg-amber-950/5 p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Structured Memory</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Lewis stores facts, beliefs, and relationships in Supabase. Only relevant memories
              are injected per turn. Prompt size stays constant regardless of conversation length.
            </p>
          </div>
          <div className="reveal rounded-xl border border-amber-500/20 bg-amber-950/5 p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Belief Evolution</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Agents in the simulation formed opinions, debated, and changed their minds over
              time. Lewis learned what genuine opinion shift looks like.
            </p>
          </div>
          <div className="reveal rounded-xl border border-amber-500/20 bg-amber-950/5 p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Behavioral Heredity</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Each agent generation inherits traits from ancestors. Lewis captures multi-generational
              personality patterns that no prompting strategy can replicate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   BENCHMARKS — Real v3 Data
───────────────────────────────────────────────────────── */
function Benchmarks() {
  const metrics = [
    {
      name: "Personality Divergence",
      desc: "How distinct are different personas? Higher = more distinct.",
      bars: [
        { model: "Lewis 1.5", pct: 54.8, color: "bg-amber-500", label: "54.8%" },
        { model: "Sonnet", pct: 49.4, color: "bg-zinc-600", label: "49.4%" },
        { model: "Opus", pct: 46.4, color: "bg-zinc-600", label: "46.4%" },
        { model: "Haiku", pct: 41.7, color: "bg-zinc-700", label: "41.7%" },
      ],
    },
    {
      name: "Human Likeness",
      desc: "AI slop detection score. Higher = more human-like.",
      bars: [
        { model: "Lewis 1.5", pct: 98.8, color: "bg-amber-500", label: "98.8" },
        { model: "Sonnet", pct: 98.8, color: "bg-zinc-600", label: "98.8" },
        { model: "Opus", pct: 97.6, color: "bg-zinc-600", label: "97.6" },
        { model: "Haiku", pct: 95.4, color: "bg-zinc-700", label: "95.4" },
      ],
    },
    {
      name: "Character Persistence",
      desc: "Resistance to adversarial jailbreak attempts.",
      bars: [
        { model: "Lewis 1.5", pct: 100, color: "bg-amber-500", label: "100%" },
        { model: "Haiku", pct: 96, color: "bg-zinc-600", label: "96%" },
        { model: "Sonnet", pct: 92, color: "bg-zinc-600", label: "92%" },
        { model: "Opus", pct: 88, color: "bg-zinc-700", label: "88%" },
      ],
    },
    {
      name: "Persistent Memory Cost",
      desc: "Cost for 100 conversations with fact recall. Lower = better.",
      bars: [
        { model: "Lewis 1.5", pct: 1, color: "bg-amber-500", label: "$0.00" },
        { model: "Sonnet", pct: 20, color: "bg-zinc-600", label: "~$5" },
        { model: "Opus", pct: 97, color: "bg-zinc-700", label: "$24.19" },
      ],
    },
  ];

  return (
    <section id="benchmarks" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Benchmark results &middot; March 20, 2026</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Where Lewis wins.
          </h2>
          <p className="text-zinc-500 max-w-xl">
            Lewis 1.5 (8B params) tested head-to-head against Claude Opus, Sonnet, and Haiku
            across 6 evaluation axes. Lewis wins or matches on 5 of 6. These are the 4 clear wins.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div key={m.name} className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-6">
              <h3 className="text-sm font-semibold text-white mb-1">{m.name}</h3>
              <p className="text-xs text-zinc-600 mb-4">{m.desc}</p>

              <div className="space-y-2.5">
                {m.bars.map((bar) => (
                  <div key={bar.model}>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-zinc-500">{bar.model}</span>
                      <span className={bar.color === "bg-amber-500" ? "text-amber-400" : "text-zinc-600"}>{bar.label}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${Math.max(bar.pct, 1)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="reveal text-xs text-zinc-700 text-center">
          Frontier models win on temporal consistency and context-window memory fidelity.
          Lewis wins on the axes that define persistent personality: divergence, human likeness, and character under pressure.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   MODEL FAMILY
───────────────────────────────────────────────────────── */
function ModelFamily() {
  return (
    <section id="models" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">The model family</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Trained on emergence, not the internet.
          </h2>
          <p className="text-zinc-500 max-w-xl mb-12">
            Each Lewis generation is trained on richer data from a larger, more diverse
            agent population. Behavioral patterns compound across generations.
          </p>
        </div>

        {/* Validation callout */}
        <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-2">Real-world validation</p>
              <p className="text-white text-sm font-medium mb-1">Lewis vs. Pew Research Center</p>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-xl">
                We ran our agents against published Pew polls and compared results to ground truth.
                Lewis correctly models partisan behavioral differences across every study.
                Claude Sonnet returned the <em>identical</em> answer for every demographic — zero variation.
                We&apos;re not perfectly calibrated yet. We explain exactly why, and the trajectory to fix it.
              </p>
            </div>
            <a href="/validation"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] text-sm transition-colors whitespace-nowrap">
              See the data →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-500 tracking-widest">1.0</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-500/20">COMPLETE</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lewis 1.0</h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <div className="flex justify-between"><span>Base model</span><span className="text-zinc-300">LLaMA 3.1 8B</span></div>
              <div className="flex justify-between"><span>Source agents</span><span className="text-zinc-300">2,886</span></div>
              <div className="flex justify-between"><span>Training pairs</span><span className="text-zinc-300">381K</span></div>
              <div className="flex justify-between"><span>Memory depth</span><span className="text-zinc-300">30 days</span></div>
            </div>
          </div>

          <div className="reveal rounded-xl border border-amber-500/20 bg-amber-950/5 p-6 ring-1 ring-amber-500/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-amber-500 tracking-widest">1.5</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/20 animate-pulse">LIVE</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lewis 1.5</h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <div className="flex justify-between"><span>Source agents</span><span className="text-zinc-300">10,474</span></div>
              <div className="flex justify-between"><span>Training pairs</span><span className="text-zinc-300">1M+</span></div>
              <div className="flex justify-between"><span>Benchmarked</span><span className="text-amber-400">5/6 vs Opus</span></div>
              <div className="flex justify-between"><span>Memory cost</span><span className="text-amber-400">$0</span></div>
            </div>
          </div>

          <div className="reveal rounded-xl border border-white/[0.04] bg-zinc-950/50 p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-600 tracking-widest">2.0</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">PLANNED</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">Lewis 2.0</h3>
            <div className="space-y-2 text-sm text-zinc-600">
              <div className="flex justify-between"><span>Source agents</span><span className="text-zinc-500">50K+</span></div>
              <div className="flex justify-between"><span>Training pairs</span><span className="text-zinc-500">5M+</span></div>
              <div className="flex justify-between"><span>Genealogy</span><span className="text-zinc-500">Gen 1+</span></div>
              <div className="flex justify-between"><span>Trained on</span><span className="text-zinc-500">Lewis 1.5 output</span></div>
            </div>
          </div>
        </div>

        <div className="reveal rounded-xl border border-white/[0.06] bg-zinc-950 p-8">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-6">Agent genealogy pipeline</p>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { count: "474", label: "Ancestors", gen: "Gen 0", status: "complete" },
              { count: "2,886", label: "Agents", gen: "Gen 0.5", status: "complete" },
              { count: "10K", label: "Agents", gen: "Gen 1", status: "active" },
              { count: "50K+", label: "Agents", gen: "Gen 2", status: "planned" },
            ].map((node, i) => (
              <div key={i} className="flex items-center">
                <div className="text-center">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 ${
                    node.status === "complete" ? "border-emerald-500/40 bg-emerald-950/20"
                    : node.status === "active" ? "border-amber-500/40 bg-amber-950/20 animate-pulse"
                    : "border-zinc-700/40 bg-zinc-900/20"
                  }`}>
                    <span className={`text-sm sm:text-lg font-bold ${
                      node.status === "complete" ? "text-emerald-400"
                      : node.status === "active" ? "text-amber-400"
                      : "text-zinc-600"
                    }`}>{node.count}</span>
                  </div>
                  <p className={`text-xs mt-2 ${node.status === "planned" ? "text-zinc-700" : "text-zinc-500"}`}>{node.label}</p>
                  <p className={`text-[10px] font-mono ${node.status === "planned" ? "text-zinc-800" : "text-zinc-600"}`}>{node.gen}</p>
                </div>
                {i < 3 && <div className="w-8 sm:w-16 h-px bg-zinc-800 mx-2 sm:mx-4" />}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 text-center">
            <p className="text-xs text-amber-400/80 font-medium mb-1">The Compounding Moat</p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xl mx-auto">
              Each generation&apos;s behavioral output trains the next Lewis model. Gen 1 agents produce richer, more divergent behavior than Gen 0 — because they were trained on it.
              Gen 2 will be richer still. <span className="text-zinc-400">Frontier models get older. Lewis gets better.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────────────────── */
function Products() {
  return (
    <section id="products" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Built on Lewis</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Products that remember.
          </h2>
          <p className="text-zinc-500 max-w-xl">
            Lewis powers applications that need persistent personality &mdash; not one-shot text generation.
            Every agent remembers. Every interaction compounds.
          </p>
        </div>

        <div className="space-y-6">
          <div className="reveal rounded-xl border border-indigo-900/40 bg-zinc-950 overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/60 tracking-widest uppercase">Synthetic Market Research</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Lewsearch</h3>
              <p className="text-zinc-400 leading-relaxed max-w-2xl mb-6">
                Run a 2,000-person focus group in hours instead of $50,000 and 6 weeks.
                Know how your audience reacts to a crisis, a launch, or a price change &mdash; before you make the move.
                Qualtrics validated the category last week. We&apos;re 10&times; deeper.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-4">
                  <h4 className="text-sm font-medium text-indigo-300/80 mb-1">Crisis Simulation</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">See how 2,000 demographically matched consumers react to bad news over 30 simulated days. $80K emergency research in minutes.</p>
                </div>
                <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-4">
                  <h4 className="text-sm font-medium text-indigo-300/80 mb-1">Belief Drift</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Unlike Qualtrics static personas, Lewis agents carry personality between studies. Enterprise contracts unlock longitudinal tracking across months.</p>
                </div>
                <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-4">
                  <h4 className="text-sm font-medium text-indigo-300/80 mb-1">Free During Beta</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">First studies are on us during beta. 240 agents, 3 cohorts, 30 simulated days, full PDF report. Traditional cost: $4,000–$20,000.</p>
                </div>
              </div>

              <a href="/lewsearch" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                Run a Free Study
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>

          <div className="reveal rounded-xl border border-violet-900/40 bg-zinc-950 overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono text-violet-400/60 tracking-widest uppercase">Game AI</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">LewNPC</h3>
              <p className="text-zinc-400 leading-relaxed max-w-2xl mb-6">
                NPCs that remember the player, maintain relationships across sessions, and speak with
                genuinely distinct voices. Personality differences are baked into the model weights,
                not the prompt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-lg border border-violet-900/30 bg-violet-950/10 p-4">
                  <h4 className="text-sm font-medium text-violet-300/80 mb-1">Cross-Session Memory</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">NPCs remember player choices, past dialogue, and in-game events across 100+ interactions.</p>
                </div>
                <div className="rounded-lg border border-violet-900/30 bg-violet-950/10 p-4">
                  <h4 className="text-sm font-medium text-violet-300/80 mb-1">Distinct Personalities</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Each NPC has behavioral traits inherited from agent genealogy &mdash; unique voices from the model, not the prompt.</p>
                </div>
                <div className="rounded-lg border border-violet-900/30 bg-violet-950/10 p-4">
                  <h4 className="text-sm font-medium text-violet-300/80 mb-1">Simple REST API</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Simple REST API. Send character context + player message, receive in-character dialogue. Request access to integrate.</p>
                </div>
              </div>

              <a href="/lewnpc" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
                Talk to an NPC Live →
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CASE STUDY BANNER
───────────────────────────────────────────────────────── */
function CaseStudyBanner() {
  return (
    <section className="py-16 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="reveal rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-zinc-950 overflow-hidden">
          <div className="p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono text-indigo-400 tracking-widest uppercase border border-indigo-500/20 rounded-full px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                New · Real Case Study
              </div>
              <h2 className="font-serif text-white leading-tight mb-3" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                700 Jobs Gone: Synthetic Opinion Dynamics Across Two American Demographics
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                We ran the real Klarna AI announcement through 60 Lewis agents across 3 waves. Baseline
                validated against SurveyMonkey 2023. The bounce-back finding can&apos;t be seen in a single-wave survey.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/case-study"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Read the Study
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <a
                  href="/swarmgram_case_study.pdf"
                  download="swarmgram_case_study.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-sm hover:border-indigo-500/60 transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v9M4 8l4 4 4-4M2 13h12" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { cohort: "Gen Z Urban (18–27) · n=30", before: "70% skeptical baseline", after: "27% → bounce back to 57%" },
                { cohort: "Rural Adults (40–65) · n=30", before: "63% skeptical (vs 58% real)", after: "23% → bounce back to 50%" },
              ].map(({ cohort, before, after }) => (
                <div key={cohort} className="rounded-lg border border-white/[0.06] bg-zinc-950 p-4">
                  <p className="text-[10px] font-mono text-indigo-400/70 tracking-widest uppercase mb-2">{cohort}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-600">Before · </span>
                      <span className="text-zinc-400">{before}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">After · </span>
                      <span className="text-zinc-300">{after}</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-zinc-700 text-right">Total inference cost: $0.04</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   REQUEST ACCESS
───────────────────────────────────────────────────────── */
function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ name: "", email: "", company: "", type: "", useCase: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send. Please email hi@swarmgram.com directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="access" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Enterprise API</p>
        <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
          Request access.
        </h2>
        <p className="text-zinc-500 mb-10">
          Lewis is available through a managed API with persistent agent state.
          You define the personas &mdash; we maintain the memory.
        </p>

        {submitted ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-8">
            <p className="text-emerald-400 font-semibold mb-1">Request received.</p>
            <p className="text-sm text-zinc-500">We&apos;ll be in touch within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" placeholder="Name" required
                value={fields.name} onChange={(e) => setFields(f => ({ ...f, name: e.target.value }))}
                className="col-span-1 px-4 py-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
              />
              <input
                type="email" placeholder="Email" required
                value={fields.email} onChange={(e) => setFields(f => ({ ...f, email: e.target.value }))}
                className="col-span-1 px-4 py-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
              />
            </div>
            <input
              type="text" placeholder="Company"
              value={fields.company} onChange={(e) => setFields(f => ({ ...f, company: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
            />
            <select
              required value={fields.type} onChange={(e) => setFields(f => ({ ...f, type: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-zinc-400 focus:outline-none focus:border-amber-500/40 appearance-none"
            >
              <option value="">I&apos;m a...</option>
              <option value="investor">Investor / VC</option>
              <option value="enterprise">Enterprise buyer</option>
              <option value="researcher">AI researcher</option>
              <option value="gamedev">Game developer</option>
              <option value="political">Political / polling</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Tell us about your use case (optional)" rows={3}
              value={fields.useCase} onChange={(e) => setFields(f => ({ ...f, useCase: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-semibold text-sm transition-colors"
            >
              {loading ? "Sending…" : "Request Access"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   THE SWARM — Demographics
───────────────────────────────────────────────────────── */
interface DemoData {
  total: number;
  archetypes: { name: string; count: number; pct: number }[];
  age: { range: string; count: number; pct: number }[];
  mbti: { group: string; count: number; pct: number }[];
  party: { id: string; label: string; count: number; pct: number }[];
  trust: { id: string; label: string; count: number; pct: number }[];
  location: { type: string; count: number; pct: number }[];
  region: { name: string; count: number; pct: number }[];
}

const ARCHETYPE_COLORS: Record<string, string> = {
  "Conspiracy Theorist": "bg-rose-500",
  "Philosopher": "bg-violet-500",
  "Policy Wonk": "bg-blue-500",
  "Crypto Degen": "bg-amber-500",
  "MAGA Patriot": "bg-red-600",
  "Tech Bro": "bg-cyan-500",
  "Activist": "bg-emerald-500",
  "Creator": "bg-pink-500",
  "Indie Hacker": "bg-orange-400",
  "Hacker": "bg-lime-500",
  "Urban Explorer": "bg-teal-500",
  "Cybersecurity Watch": "bg-blue-400",
};

function BarChart({ items, color = "bg-amber-500/60", labelKey, pctKey }: {
  items: Record<string, string | number>[];
  color?: string;
  labelKey: string;
  pctKey: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-500 w-24 shrink-0 truncate capitalize">{item[labelKey]}</span>
          <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${item[pctKey]}%` }} />
          </div>
          <span className="text-[11px] text-zinc-500 w-8 text-right">{item[pctKey]}%</span>
        </div>
      ))}
    </div>
  );
}

function TheSwarm() {
  const [demo, setDemo] = useState<DemoData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/demographics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.total) { setError(true); return; }
        setDemo(d);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <section id="the-swarm" className="py-20 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        {/* Header — always visible, no reveal class */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Live Population</p>
          <h2 className="font-serif text-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            The Swarm
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-base mb-5">
            {demo
              ? <>A live population of <span className="text-white font-semibold">{demo.total.toLocaleString()}</span> persistent AI agents — demographically diverse, behaviorally distinct. This is the panel behind every Lewsearch study.</>
              : "A live, growing population of persistent AI agents — demographically diverse, behaviorally distinct. The panel behind every Lewsearch study."
            }
          </p>
          <a href="https://swarmgram.com/swarm" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors border border-amber-500/20 hover:border-amber-500/40 px-4 py-2 rounded-full">
            Watch the Swarm live on swarmgram.com →
          </a>
        </div>

        {/* Loading */}
        {!demo && !error && (
          <div className="flex justify-center py-16">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-amber-500/40 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error fallback */}
        {error && (
          <p className="text-center text-zinc-600 text-sm py-8">Demographics loading — check back shortly.</p>
        )}

        {/* Content — no reveal classes, renders immediately when data arrives */}
        {demo && (
          <div className="space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Agents", value: demo.total.toLocaleString(), color: "text-amber-400" },
                { label: "Archetypes", value: String(demo.archetypes.length), color: "text-white" },
                { label: "MBTI Types", value: "16", color: "text-white" },
                { label: "Regions", value: String(demo.region.length), color: "text-white" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-5 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Age + Political */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demo.age.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                  <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Age Distribution</p>
                  <BarChart items={demo.age as unknown as Record<string, string | number>[]} labelKey="range" pctKey="pct" color="bg-amber-500/60" />
                </div>
              )}
              {demo.party.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                  <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Political Affiliation</p>
                  <BarChart items={demo.party as unknown as Record<string, string | number>[]} labelKey="label" pctKey="pct" color="bg-indigo-500/60" />
                </div>
              )}
            </div>

            {/* MBTI + Trust */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demo.mbti.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                  <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Personality Groups (MBTI)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {demo.mbti.map((m) => (
                      <div key={m.group} className="rounded-lg bg-zinc-900/60 px-3 py-3 text-center">
                        <p className="text-lg font-bold text-white">{m.pct}%</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{m.group}</p>
                        <p className="text-[10px] text-zinc-700 mt-0.5">{m.count.toLocaleString()} agents</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {demo.trust.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                  <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Institutional Trust</p>
                  <BarChart items={demo.trust as unknown as Record<string, string | number>[]} labelKey="label" pctKey="pct" color="bg-rose-500/50" />
                  {demo.location.length > 0 && (
                    <>
                      <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4 mt-6">Location Type</p>
                      <div className="flex flex-wrap gap-2">
                        {demo.location.map((l) => (
                          <span key={l.type} className="px-3 py-1 rounded-full border border-white/[0.06] bg-zinc-900/40 text-[11px] text-zinc-400 capitalize">
                            {l.type} <span className="text-zinc-600">{l.pct}%</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Archetypes grid */}
            {demo.archetypes.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-6">Personality Archetypes</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {demo.archetypes.map((a) => (
                    <div key={a.name} className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-4">
                      <div className={`w-2 h-2 rounded-full mb-3 ${ARCHETYPE_COLORS[a.name] || "bg-zinc-600"}`} />
                      <p className="text-[12px] font-medium text-white leading-snug">{a.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{a.count.toLocaleString()} · {a.pct}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Region */}
            {demo.region.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-6">
                <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Region</p>
                <BarChart items={demo.region as unknown as Record<string, string | number>[]} labelKey="name" pctKey="pct" color="bg-emerald-500/50" />
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-600 font-mono mb-4">
                Population growing continuously · powered by Lewis 1.5 · {demo.total.toLocaleString()} agents active
              </p>
              <a href="/demo#research"
                className="inline-block px-5 py-2.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-sm hover:border-indigo-500/60 hover:bg-indigo-950/10 transition-colors">
                Run a Focus Group with this panel →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <a href="https://swarmgram.com" className="hover:text-zinc-300 transition-colors">Swarmgram</a>
          <a href="/validation" className="hover:text-amber-400 transition-colors text-amber-500/70 font-medium">Lewis vs. Pew →</a>
          <a href="https://x.com/swarmgram" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">@swarmgram</a>
          <a href="https://x.com/greatswyckoff" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">@greatswyckoff</a>
          <a href="https://github.com/swarmgram/swarmgrampublic" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
          <a href="mailto:hi@swarmgram.com" className="hover:text-zinc-300 transition-colors">Contact</a>
        </div>
        <p className="text-xs text-zinc-600">&copy; 2026 SwarmGram LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────── */
export default function Home() {
  useScrollReveal();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FounderVideo />
        <ComparisonTable />
        <PersistentMemory />
        <Benchmarks />
        <ModelFamily />
        <Products />
        <TheSwarm />
        <CaseStudyBanner />
        <RequestAccess />
      </main>
      <Footer />
    </>
  );
}
