"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Pre-baked Liquid Death study data ────────────────────────────────────────
const SAMPLE_STUDY = {
  brand: "Liquid Death",
  scenario: "Brand crisis simulation: Liquid Death announces expansion into single-use plastic packaging for a new energy drink line — tested against their core audience before public launch.",
  date: "March 2026",
  agents: 240,
  simDays: 30,
  cohorts: [
    {
      label: "Eco-Conscious Millennials (25–38)",
      n: 80,
      waves: [
        { wave: "Baseline", positive: 74, neutral: 16, negative: 10 },
        { wave: "Post-Announcement", positive: 18, neutral: 15, negative: 67 },
        { wave: "After Pledge Explanation", positive: 31, neutral: 22, negative: 47 },
      ],
      insight: "This segment drove Liquid Death's initial growth. Plastic packaging triggers a near-total sentiment collapse — 74% positive → 18%. Even after the \"sustainability pledge\" explanation, trust does not recover. Net drift: −43 pts.",
      quotes: [
        { persona: "Maya, 31 — Environmental Advocate, Portland", text: "This is exactly the kind of greenwashing I've been warning people about. I've been buying Liquid Death specifically because they weren't doing this." },
        { persona: "Connor, 28 — Outdoor Enthusiast, Denver", text: "I'm not naive — I know they're a company. But this is the one line I thought they wouldn't cross. It feels like losing something." },
      ],
    },
    {
      label: "Casual Energy Drink Consumers (18–30)",
      n: 80,
      waves: [
        { wave: "Baseline", positive: 52, neutral: 34, negative: 14 },
        { wave: "Post-Announcement", positive: 41, neutral: 38, negative: 21 },
        { wave: "After Pledge Explanation", positive: 48, neutral: 35, negative: 17 },
      ],
      insight: "Minimal impact. This cohort chose Liquid Death for taste and brand vibe, not environmental mission. They are essentially unmoved by the packaging decision. Net drift: −4 pts — within noise. Retainable.",
      quotes: [
        { persona: "Jake, 22 — College Student, Austin", text: "Honestly didn't even know that was their thing. Still tastes good." },
        { persona: "Sofia, 25 — Retail Worker, Atlanta", text: "I'm not sure what the big deal is. Half the drinks I buy come in plastic. This doesn't really change anything for me." },
      ],
    },
    {
      label: "Brand Loyalists / Heavy Users (All Ages)",
      n: 80,
      waves: [
        { wave: "Baseline", positive: 88, neutral: 9, negative: 3 },
        { wave: "Post-Announcement", positive: 44, neutral: 23, negative: 33 },
        { wave: "After Pledge Explanation", positive: 59, neutral: 21, negative: 20 },
      ],
      insight: "The most interesting cohort: initial brand love is high (88%), and the announcement cuts deep. Unlike eco-millennials, however, explanation partially restores trust. With the right messaging, ~60% retention is achievable. The 20% who remain negative become brand detractors.",
      quotes: [
        { persona: "Marcus, 34 — Marketing Professional, NYC", text: "I've been a fan since day one. This hurts. But I want to hear them out — if the offset program is real, I'm willing to hold on." },
        { persona: "Rachel, 29 — Fitness Instructor, Chicago", text: "The hardcore fans are going to be angry. But if they handle the response well, I think they can keep most of us." },
      ],
    },
  ],
  topline: [
    { label: "Overall brand sentiment drop post-announcement", value: "−31 pts", highlight: true },
    { label: "Eco-conscious segment: net negative drift", value: "−43 pts", highlight: true },
    { label: "Recoverable after explanation (brand loyalists)", value: "~60%", highlight: false },
    { label: "Casual consumer segment: effectively unaffected", value: "−4 pts", highlight: false },
    { label: "Simulated days of drift tracked", value: "30 days", highlight: false },
    { label: "Agents surveyed", value: "240 agents", highlight: false },
  ],
  recommendation: "Do not launch without a robust pre-announcement communication plan targeting the eco-conscious core. The casual segment is safe. Brand loyalists can be partially retained with genuine commitment signaling — not marketing language. Consider a co-creation campaign with environmental advocates before announcement.",
};

// ── Access code component ─────────────────────────────────────────────────────
function AccessCodeGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/lewsearch-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate", code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (data.valid) {
      router.push(`/lewsearch/run?code=${encodeURIComponent(code.trim().toUpperCase())}`);
    } else {
      setError("Invalid or already-used access code. Request one below.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-[#0F0D08] p-8 max-w-md mx-auto text-center">
      <p className="text-xs font-mono text-amber-600 tracking-widest uppercase mb-3">Access Required</p>
      <h3 className="text-white text-xl font-semibold mb-2">Run your own study</h3>
      <p className="text-zinc-400 text-sm mb-6">
        Enter your access code to run a real 30-day simulation for your brand.
        Results in minutes. Normally costs $4,000–$20,000 from traditional panels.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text" placeholder="ENTER ACCESS CODE"
          value={code} onChange={e => setCode(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/10 text-center text-white font-mono text-sm tracking-widest focus:outline-none focus:border-amber-500/50 uppercase"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading || !code.trim()}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm transition-colors">
          {loading ? "Checking…" : "Launch Simulation →"}
        </button>
      </form>
      <p className="text-zinc-600 text-xs mt-4">
        No code?{" "}
        <a href="#request" className="text-amber-600 hover:text-amber-400">Request free access below →</a>
      </p>
    </div>
  );
}

// ── Bar chart component ───────────────────────────────────────────────────────
function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div className="flex h-6 rounded overflow-hidden text-xs font-mono">
      <div className="flex items-center justify-center text-black font-bold transition-all" style={{ width: `${positive}%`, background: "#10B981" }}>
        {positive > 8 ? `${positive}%` : ""}
      </div>
      <div className="flex items-center justify-center text-zinc-500 transition-all" style={{ width: `${neutral}%`, background: "#27272A" }}>
        {neutral > 8 ? `${neutral}%` : ""}
      </div>
      <div className="flex items-center justify-center text-white font-bold transition-all" style={{ width: `${negative}%`, background: "#EF4444" }}>
        {negative > 8 ? `${negative}%` : ""}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LewsearchPage() {
  const [openCohort, setOpenCohort] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F2F2F5]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#08080E]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-sm text-zinc-400 hover:text-white transition-colors">← lewis.works</a>
          <span className="font-mono text-xs text-amber-500 tracking-widest uppercase">Lewsearch</span>
          <a href="#request" className="text-xs border border-amber-500/30 text-amber-400 px-3 py-1 rounded hover:bg-amber-500/10 transition-colors">
            Request Free Study
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">

        {/* Hero */}
        <div className="text-center mb-20">
          <p className="text-xs font-mono text-amber-500 tracking-widest uppercase mb-4">Synthetic Research Platform</p>
          <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
            Know how your audience reacts<br />
            <em className="text-zinc-400">before you make the move.</em>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Run a 30-day brand crisis simulation against 2,000 demographically matched AI agents.
            Real opinions. Real drift. Results in minutes, not months.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-zinc-500 flex-wrap">
            <span className="bg-zinc-900 border border-white/10 px-3 py-1 rounded-full">Traditional panel: 6–8 weeks · $20K+</span>
            <span className="text-amber-500 font-bold text-lg">vs</span>
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">Lewsearch: ~10 minutes · Free pilot</span>
          </div>
        </div>

        {/* Sample Study */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Sample Study</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
        </div>

        {/* Study header */}
        <div className="rounded-2xl border border-white/8 bg-[#0F0F16] p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Brand Perception · Crisis Simulation</p>
              <h2 className="text-3xl font-serif text-white mb-1">{SAMPLE_STUDY.brand}</h2>
              <p className="text-zinc-400 text-sm max-w-2xl">{SAMPLE_STUDY.scenario}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-zinc-900 rounded-xl p-4 min-w-[80px]">
                <div className="text-2xl font-bold text-amber-400">{SAMPLE_STUDY.agents}</div>
                <div className="text-xs text-zinc-500">Agents</div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4 min-w-[80px]">
                <div className="text-2xl font-bold text-amber-400">{SAMPLE_STUDY.simDays}</div>
                <div className="text-xs text-zinc-500">Sim days</div>
              </div>
            </div>
          </div>

          {/* Topline numbers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {SAMPLE_STUDY.topline.map((t, i) => (
              <div key={i} className={`rounded-xl p-4 border ${t.highlight ? "border-amber-500/30 bg-amber-500/5" : "border-white/5 bg-zinc-900/50"}`}>
                <div className={`text-xl font-bold mb-1 ${t.highlight ? "text-amber-400" : "text-white"}`}>{t.value}</div>
                <div className="text-xs text-zinc-500">{t.label}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-zinc-500 mb-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Positive</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-zinc-700 inline-block" /> Neutral</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Negative</span>
          </div>
        </div>

        {/* Cohort breakdown */}
        <div className="space-y-4 mb-8">
          {SAMPLE_STUDY.cohorts.map((cohort, ci) => (
            <div key={ci} className="rounded-xl border border-white/8 bg-[#0F0F16] overflow-hidden">
              <button
                onClick={() => setOpenCohort(openCohort === ci ? null : ci)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors"
              >
                <div className="text-left">
                  <div className="text-white font-semibold">{cohort.label}</div>
                  <div className="text-zinc-500 text-sm">{cohort.n} agents · {cohort.waves.length} waves</div>
                </div>
                <span className="text-zinc-500 text-lg">{openCohort === ci ? "−" : "+"}</span>
              </button>

              {openCohort === ci && (
                <div className="px-6 pb-6 border-t border-white/5">
                  {/* Sentiment waves */}
                  <div className="space-y-3 mt-5 mb-5">
                    {cohort.waves.map((w, wi) => (
                      <div key={wi}>
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>{w.wave}</span>
                          <span>{w.positive}% positive · {w.negative}% negative</span>
                        </div>
                        <SentimentBar positive={w.positive} neutral={w.neutral} negative={w.negative} />
                      </div>
                    ))}
                  </div>

                  {/* Insight */}
                  <div className="bg-zinc-900/60 border border-amber-500/15 rounded-xl p-4 mb-5">
                    <p className="text-xs font-mono text-amber-600 uppercase tracking-wider mb-1">Key Insight</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{cohort.insight}</p>
                  </div>

                  {/* Agent quotes */}
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Agent Responses</p>
                    {cohort.quotes.map((q, qi) => (
                      <div key={qi} className="border-l-2 border-zinc-700 pl-4">
                        <p className="text-zinc-300 text-sm italic leading-relaxed mb-1">&ldquo;{q.text}&rdquo;</p>
                        <p className="text-zinc-600 text-xs">{q.persona}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 mb-20">
          <p className="text-xs font-mono text-emerald-500 uppercase tracking-wider mb-2">Strategic Recommendation</p>
          <p className="text-zinc-300 leading-relaxed">{SAMPLE_STUDY.recommendation}</p>
        </div>

        {/* Access code gate */}
        <div id="run" className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-white mb-3">Run your brand through the simulation.</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Enter an access code to launch a real study — 240 agents, 3 cohorts, 30 simulated days.
              Your results in ~10 minutes.
            </p>
          </div>
          <AccessCodeGate />
        </div>

        {/* Request form */}
        <div id="request" className="rounded-2xl border border-white/8 bg-[#0F0F16] p-10 text-center">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Free Pilot</p>
          <h2 className="font-serif text-3xl text-white mb-3">
            Get your access code.
          </h2>
          <p className="text-zinc-400 mb-2 max-w-lg mx-auto text-sm">
            We run your brand&apos;s first study for free. What you&apos;d normally pay $4,000–$20,000 and wait 6 weeks for —
            we deliver in a morning.
          </p>
          <p className="text-zinc-600 text-xs mb-8">
            2,000 agents · 3 demographic cohorts · 30-day belief drift · Full PDF report
          </p>

          <RequestForm />
        </div>
      </div>
    </div>
  );
}

function RequestForm() {
  const [fields, setFields] = useState({ name: "", email: "", company: "", useCase: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, type: "lewsearch", source: "lewsearch_page" }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-8 max-w-md mx-auto">
        <p className="text-emerald-400 font-semibold mb-1">Request received.</p>
        <p className="text-sm text-zinc-500">You&apos;ll receive an access code within 24 hours at {fields.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md mx-auto text-left">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" required placeholder="Name" value={fields.name}
          onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
          className="px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40" />
        <input type="email" required placeholder="Work email" value={fields.email}
          onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
          className="px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40" />
      </div>
      <input type="text" required placeholder="Company or brand" value={fields.company}
        onChange={e => setFields(f => ({ ...f, company: e.target.value }))}
        className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40" />
      <textarea rows={2} placeholder="What would you want to test? (optional)" value={fields.useCase}
        onChange={e => setFields(f => ({ ...f, useCase: e.target.value }))}
        className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-none" />
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm transition-colors">
        {loading ? "Sending…" : "Get Free Access Code →"}
      </button>
    </form>
  );
}
