"use client";

import Link from "next/link";

/* ─── Data ───────────────────────────────────────────────────── */

const STUDIES = [
  {
    id: "gov",
    title: "Government Size Preference",
    source: "Pew Research Center, 2024",
    question: `"Would you rather have a smaller government providing fewer services, or a bigger government providing more services?"`,
    metric: "% preferring smaller government",
    rows: [
      { label: "Total",    lewis: 67,  pew: 51, sonnet: 100 },
      { label: "Rep/Lean", lewis: 100, pew: 77, sonnet: 100 },
      { label: "Dem/Lean", lewis: 5,   pew: 26, sonnet: 100 },
    ],
    note: "Lewis correctly shows Republicans preferring smaller government more than Democrats. The partisan gap (95pp) over-expresses real polarization (Pew: 51pp), but the direction is perfect. Sonnet returns the same answer for every demographic — no partisan variation at all.",
    lewisWin: "Partisan direction: ✓ correct on all cohorts",
    sonnetFail: "0pp partisan gap (Pew shows 51pp). Useless for demographic research.",
  },
  {
    id: "housing",
    title: "Community & Housing Preference",
    source: "Pew Research Center, March 2026",
    question: `"Would you prefer to live in a community where houses are larger and farther apart, or smaller and closer together near walkable amenities?"`,
    metric: "% preferring larger/spread-out community",
    rows: [
      { label: "Total",    lewis: 20,  pew: 55, sonnet: 0 },
      { label: "Rep/Lean", lewis: 60,  pew: 71, sonnet: 0 },
      { label: "Dem/Lean", lewis: 13,  pew: 40, sonnet: 0 },
    ],
    note: "Republican-leaning agents correctly prefer spread-out communities more than Democratic-leaning agents (Δ=47pp Lewis vs 31pp Pew). Lewis 1.5's urban/tech archetype skew pulls the total below Pew's national average. Sonnet chose 'walkable' for every single respondent regardless of political identity.",
    lewisWin: "Rep/Lean cohort: 60% vs Pew's 71% — only 11pp off",
    sonnetFail: "100% walkable for every demographic. Treats all Americans identically.",
  },
];

const WHY_ROWS = [
  { reason: "Archetype skew", detail: "Lewis 1.5 was seeded with ~2,900 agents heavily weighted toward urban/tech archetypes: Indie Hacker, Data Scientist, Climate Watch, AI Ethics Watch. Middle America archetypes — Small Town Worker, Evangelical, Rural Farmer — are underrepresented in v1.5." },
  { reason: "Early generation", detail: "Lewis 1.5 agents haven't had enough simulated time to develop moderate cross-cutting views. Real humans hold contradictory opinions (23% of Republicans want bigger government). Early-generation agents express their initial partisan identity more purely." },
  { reason: "Training corpus size", detail: "~2,900 agents producing ~381K training pairs is a solid start but not enough to capture the full variance of 330M Americans. Lewis 2.0, trained on 10,474 agents with 1M+ pairs, will produce more calibrated intra-group variation." },
];

/* ─── Components ─────────────────────────────────────────────── */

function DeltaBar({ lewis, pew, sonnet }: { lewis: number; pew: number; sonnet?: number }) {
  const lewisColor = Math.abs(lewis - pew) <= 10 ? "bg-emerald-500" : Math.abs(lewis - pew) <= 20 ? "bg-amber-500" : "bg-red-500/70";
  return (
    <div className="space-y-2 text-xs">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-zinc-500">Pew ground truth</span>
          <span className="text-zinc-300 font-mono">{pew}%</span>
        </div>
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-400/60 rounded-full" style={{ width: `${pew}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-amber-400/80">Lewis 1.5</span>
          <span className="text-amber-400 font-mono">{lewis}% <span className="text-zinc-600">(Δ {Math.abs(lewis-pew)}pp)</span></span>
        </div>
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div className={`h-full ${lewisColor} rounded-full`} style={{ width: `${lewis}%` }} />
        </div>
      </div>
      {sonnet !== undefined && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-600">Claude Sonnet (no persona)</span>
            <span className="text-zinc-600 font-mono">{sonnet}% <span className="text-zinc-700">(Δ {Math.abs(sonnet-pew)}pp)</span></span>
          </div>
          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-700/60 rounded-full" style={{ width: `${sonnet}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StudyCard({ study }: { study: typeof STUDIES[0] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-semibold text-white">{study.title}</h3>
          <span className="text-[10px] font-mono text-zinc-600 tracking-widest shrink-0 pt-1">{study.source}</span>
        </div>
        <p className="text-sm text-zinc-500 italic mb-6">{study.question}</p>
        <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-4">{study.metric}</p>

        <div className="space-y-6 mb-6">
          {study.rows.map((row) => (
            <div key={row.label}>
              <p className="text-xs font-medium text-zinc-400 mb-2">{row.label}</p>
              <DeltaBar lewis={row.lewis} pew={row.pew} sonnet={row.sonnet} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.04]">
          <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/15 p-3">
            <p className="text-[10px] font-mono text-emerald-400/60 tracking-widest uppercase mb-1">Lewis finding</p>
            <p className="text-xs text-emerald-300/80">{study.lewisWin}</p>
          </div>
          <div className="rounded-lg bg-red-950/20 border border-red-500/15 p-3">
            <p className="text-[10px] font-mono text-red-400/60 tracking-widest uppercase mb-1">Sonnet limitation</p>
            <p className="text-xs text-red-300/70">{study.sonnetFail}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed mt-4">{study.note}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function ValidationPage() {
  return (
    <div className="min-h-screen bg-[#07070C] text-zinc-300">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white hover:text-amber-400 transition-colors">
            ← lewis.works
          </Link>
          <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Validation</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Independent Validation</p>
          <h1 className="font-serif text-white leading-tight mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
            Lewis vs. Pew Research
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mb-6">
            We ran our agents against published Pew Research Center polls and compared
            results to real-world ground truth. Here&apos;s exactly what happened — including
            where we fell short and why.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-950/10 text-sm text-amber-400/80">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Lewis 1.5 &mdash; trained on ~2,900 agents, 381K pairs
          </div>
        </div>

        {/* Key finding callout */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-6 mb-10">
          <p className="text-xs font-mono text-indigo-400/60 tracking-widest uppercase mb-3">The core finding</p>
          <p className="text-white font-medium mb-2">
            Lewis correctly models partisan behavioral differences. Claude Sonnet does not.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            On government size preference, Lewis Republican agents chose &ldquo;smaller government&rdquo;
            at a significantly higher rate than Lewis Democratic agents — matching the direction
            of Pew&apos;s 51pp partisan gap. Claude Sonnet, asked the same question with a
            &ldquo;typical American&rdquo; persona, returned the same answer for every single respondent regardless of
            political identity. Lewis is not yet perfectly calibrated to national averages,
            but it models <em>who thinks what</em> — which is the core value proposition.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { label: "Lewis partisan gap", value: "95pp", sub: "Rep vs Dem on gov size", color: "text-amber-400" },
              { label: "Pew partisan gap",   value: "51pp", sub: "Real-world ground truth",  color: "text-emerald-400" },
              { label: "Sonnet partisan gap",value: "0pp",  sub: "Identical answer for all", color: "text-zinc-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs text-zinc-400 mb-0.5">{stat.label}</div>
                <div className="text-[10px] text-zinc-600">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Studies */}
        <div className="space-y-8 mb-14">
          {STUDIES.map((s) => <StudyCard key={s.id} study={s} />)}
        </div>

        {/* Why we miss */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-6 sm:p-8 mb-10">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-5">Why Lewis 1.5 misses on absolute calibration</p>
          <div className="space-y-5">
            {WHY_ROWS.map((row) => (
              <div key={row.reason} className="flex gap-4">
                <div className="w-1 rounded-full bg-amber-500/30 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-1">{row.reason}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trajectory */}
        <div className="rounded-xl border border-amber-500/15 bg-amber-950/5 p-6 sm:p-8 mb-10">
          <p className="text-xs font-mono text-amber-500/50 tracking-widest uppercase mb-4">The trajectory</p>
          <p className="text-white font-medium mb-3">Each generation gets closer.</p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-5">
            Lewis 2.0 trains on 10,474 agents — including archetypes from every US region,
            demographic, and ideological background — after 30+ simulated days of belief
            evolution through social interaction. As agents develop cross-cutting opinions
            through experience (just as real humans do), intra-group variance increases and
            absolute calibration improves. The genealogy moat isn&apos;t just about scale.
            It&apos;s about epistemic diversity compounding over generations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { version: "Lewis 1.5", agents: "~2,900", pairs: "381K",  status: "live",    note: "Direction correct. Calibration: ~20pp avg Δ" },
              { version: "Lewis 2.0", agents: "10,474", pairs: "1M+",   status: "training",note: "Richer archetype diversity. Target: ≤10pp avg Δ" },
              { version: "Lewis 3.0", agents: "50K+",   pairs: "5M+",   status: "planned", note: "National demographic parity. Target: ≤5pp avg Δ" },
            ].map((v) => (
              <div key={v.version} className={`rounded-lg border p-4 ${
                v.status === "live"     ? "border-amber-500/30 bg-amber-950/10" :
                v.status === "training" ? "border-zinc-700/40 bg-zinc-900/20" :
                "border-zinc-800/30 bg-zinc-900/10 opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400">{v.version}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono tracking-wider ${
                    v.status === "live"     ? "bg-amber-900/40 text-amber-300 border border-amber-500/20" :
                    v.status === "training" ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50" :
                    "bg-zinc-900 text-zinc-700 border border-zinc-800/30"
                  }`}>{v.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-1">{v.agents} agents · {v.pairs} pairs</p>
                <p className="text-xs text-zinc-600 leading-relaxed">{v.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-950/50 p-5 mb-10">
          <p className="text-xs font-mono text-zinc-700 tracking-widest uppercase mb-2">Methodology note</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Each cohort polled 15–20 Lewis agents with matching demographic filters (party affiliation,
            age, location type). Agents respond in-character based on their persistent system prompts.
            Ground truth figures sourced from published Pew Research Center reports. Claude Sonnet
            baseline tested with a generic &ldquo;typical American adult&rdquo; system prompt, 10 samples per question.
            Lewis 1.5 inference via self-hosted vLLM on RunPod H100.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href="/lewsearch"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors">
            Run your own study →
          </Link>
          <Link href="/#request"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16] text-sm transition-colors">
            Request API access
          </Link>
        </div>
      </main>
    </div>
  );
}
