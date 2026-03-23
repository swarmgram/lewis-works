"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface WaveData { wave: string; positive: number; neutral: number; negative: number; quotes: { persona: string; text: string }[]; }
interface CohortResult { label: string; n: number; waves: WaveData[]; drift: number; insight: string; quotes: { persona: string; text: string }[]; }
interface StudyResult { brand: string; scenario: string; results: CohortResult[]; }

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div className="flex h-5 rounded overflow-hidden text-xs font-mono">
      <div className="flex items-center justify-center text-black font-bold" style={{ width: `${positive}%`, background: "#10B981" }}>
        {positive > 10 ? `${positive}%` : ""}
      </div>
      <div className="flex items-center justify-center text-zinc-500" style={{ width: `${neutral}%`, background: "#27272A" }}>
        {neutral > 10 ? `${neutral}%` : ""}
      </div>
      <div className="flex items-center justify-center text-white font-bold" style={{ width: `${negative}%`, background: "#EF4444" }}>
        {negative > 10 ? `${negative}%` : ""}
      </div>
    </div>
  );
}

function RunPageContent() {
  const params = useSearchParams();
  const code = params.get("code") || "";

  const [step, setStep] = useState<"form" | "running" | "results">("form");
  const [brand, setBrand] = useState("");
  const [scenario, setScenario] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Initializing agents…");
  const [results, setResults] = useState<StudyResult | null>(null);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  async function runStudy(e: React.FormEvent) {
    e.preventDefault();
    setStep("running");
    setProgress(0);

    const labels = [
      "Selecting demographic cohorts…",
      "Loading agent memory profiles…",
      "Running Wave 1: Baseline impressions…",
      "Analyzing baseline sentiment…",
      "Running Wave 2: Initial reactions…",
      "Measuring belief drift…",
      "Running Wave 3: 30-day follow-up…",
      "Synthesizing insights…",
      "Generating report…",
    ];
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setProgress(Math.min(90, i * 10));
      setProgressLabel(labels[Math.min(i, labels.length - 1)]);
    }, 4000);

    try {
      const res = await fetch("/api/lewsearch-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", code, brand, scenario }),
      });
      const data = await res.json();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!data.success) throw new Error(data.error || "Simulation failed");
      setProgress(100);
      setProgressLabel("Complete.");
      setTimeout(() => { setResults(data); setStep("results"); }, 600);
    } catch (err: unknown) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError(err instanceof Error ? err.message : "Simulation error");
      setStep("form");
    }
  }

  function downloadPDF() {
    if (!results) return;
    // Build printable HTML and open in new window for save-as-PDF
    const html = buildPDFHtml(results);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }

  if (step === "form") return (
    <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <a href="/lewsearch" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-8 block">← Back</a>
        <p className="text-xs font-mono text-amber-500 tracking-widest uppercase mb-3">Access code: {code}</p>
        <h1 className="font-serif text-3xl text-white mb-2">Configure your study</h1>
        <p className="text-zinc-500 text-sm mb-8">We&apos;ll run 45 Lewis agents across 3 demographic cohorts through 3 waves of questioning — 30 simulated days.</p>

        {error && <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>}

        <form onSubmit={runStudy} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Brand or Product Name</label>
            <input required type="text" placeholder="e.g. Liquid Death, Tesla, Your Brand" value={brand}
              onChange={e => setBrand(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Scenario to Test</label>
            <textarea required rows={3} placeholder="e.g. We're announcing a new product line at twice the price. How will our core audience react over 30 days?"
              value={scenario} onChange={e => setScenario(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/8 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 resize-none" />
          </div>
          <button type="submit"
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors">
            Launch Simulation →
          </button>
          <p className="text-zinc-600 text-xs text-center">~10 minutes · 45 agents · 3 cohorts · 3 waves · PDF export included</p>
        </form>
      </div>
    </div>
  );

  if (step === "running") return (
    <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-8" />
        <h2 className="font-serif text-2xl text-white mb-2">Simulation running</h2>
        <p className="text-zinc-400 text-sm mb-8">{progressLabel}</p>
        <div className="w-full bg-zinc-900 rounded-full h-2 mb-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-zinc-600 text-xs">{progress}% complete</p>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {["45 agents", "3 cohorts", "3 waves"].map(s => (
            <div key={s} className="bg-zinc-900 rounded-xl p-3">
              <p className="text-amber-400 font-bold text-sm">{s.split(" ")[0]}</p>
              <p className="text-zinc-500 text-xs">{s.split(" ")[1]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!results) return null;

  const overallDrift = Math.round(results.results.reduce((s, r) => s + r.drift, 0) / results.results.length);

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F2F2F5]">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#08080E]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/lewsearch" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Lewsearch</a>
          <span className="text-xs font-mono text-amber-500">{results.brand} · Study Complete</span>
          <button onClick={downloadPDF}
            className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-1.5 rounded transition-colors">
            ↓ Download PDF
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Lewsearch · Brand Simulation</p>
          <h1 className="font-serif text-4xl text-white mb-3">{results.brand}</h1>
          <p className="text-zinc-400 max-w-2xl">{results.scenario}</p>
          <div className="flex gap-4 mt-4">
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${overallDrift > 0 ? "bg-emerald-500/10 text-emerald-400" : overallDrift < -5 ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
              Overall drift: {overallDrift > 0 ? "+" : ""}{overallDrift} pts
            </div>
            <div className="text-sm text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">45 agents · 3 cohorts · 30 sim days</div>
          </div>
        </div>

        {/* Cohorts */}
        <div className="space-y-6 mb-12">
          {results.results.map((cohort, ci) => (
            <div key={ci} className="rounded-2xl border border-white/8 bg-[#0F0F16] p-6">
              <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
                <div>
                  <h3 className="text-white font-semibold">{cohort.label}</h3>
                  <p className="text-zinc-500 text-xs">{cohort.n} agents</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${cohort.drift > 0 ? "bg-emerald-500/10 text-emerald-400" : cohort.drift < -5 ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                  Drift: {cohort.drift > 0 ? "+" : ""}{cohort.drift} pts
                </span>
              </div>

              <div className="space-y-2.5 mb-5">
                {cohort.waves.map((w, wi) => (
                  <div key={wi}>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>{w.wave}</span>
                      <span>{w.positive}% pos · {w.negative}% neg</span>
                    </div>
                    <SentimentBar positive={w.positive} neutral={w.neutral} negative={w.negative} />
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900/60 border border-amber-500/10 rounded-xl p-4 mb-4">
                <p className="text-xs font-mono text-amber-600 uppercase tracking-wider mb-1">Insight</p>
                <p className="text-zinc-300 text-sm">{cohort.insight}</p>
              </div>

              {cohort.quotes.map((q, qi) => (
                <div key={qi} className="border-l-2 border-zinc-800 pl-4 mb-3">
                  <p className="text-zinc-300 text-sm italic mb-1">&ldquo;{q.text}&rdquo;</p>
                  <p className="text-zinc-600 text-xs">{q.persona}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Want a full 2,000-agent study?</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-lg mx-auto">This was a 45-agent pilot. A full Lewsearch study runs 2,000 agents, 6 cohorts, custom demographic targeting, and delivers a complete branded PDF report.</p>
          <a href="/#access" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-6 py-3 rounded-lg transition-colors">
            Request Enterprise Study →
          </a>
        </div>
      </div>
    </div>
  );
}

function buildPDFHtml(results: StudyResult): string {
  const cohortHtml = results.results.map(c => `
    <div style="margin-bottom:24px;padding:16px;border:1px solid #ddd;border-radius:8px;">
      <h3 style="margin:0 0 4px;">${c.label}</h3>
      <p style="color:#666;font-size:12px;margin:0 0 12px;">${c.n} agents · Sentiment drift: ${c.drift > 0 ? "+" : ""}${c.drift} pts</p>
      ${c.waves.map(w => `
        <div style="margin-bottom:10px;">
          <div style="font-size:12px;color:#444;margin-bottom:4px;">${w.wave} — ${w.positive}% positive · ${w.neutral}% neutral · ${w.negative}% negative</div>
          <div style="display:flex;height:14px;border-radius:4px;overflow:hidden;">
            <div style="width:${w.positive}%;background:#10B981;"></div>
            <div style="width:${w.neutral}%;background:#d1d5db;"></div>
            <div style="width:${w.negative}%;background:#EF4444;"></div>
          </div>
        </div>`).join("")}
      <p style="background:#fffbeb;border:1px solid #f59e0b;border-radius:6px;padding:10px;font-size:13px;margin:12px 0;">${c.insight}</p>
      ${c.quotes.map(q => `<blockquote style="border-left:3px solid #ccc;padding-left:12px;margin:8px 0;font-style:italic;font-size:13px;color:#333;">"${q.text}"<br><small style="color:#888;">${q.persona}</small></blockquote>`).join("")}
    </div>`).join("");

  return `<!DOCTYPE html><html><head><title>Lewsearch — ${results.brand}</title>
  <style>body{font-family:Georgia,serif;max-width:760px;margin:0 auto;padding:32px;color:#111;}
  h1{font-size:28px;margin-bottom:4px;}h2{font-size:18px;color:#444;}
  @media print{button{display:none!important;}.no-print{display:none!important;}}</style>
  </head><body>
  <div style="border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:2px;margin:0;">LEWSEARCH · SYNTHETIC RESEARCH</p>
    <h1>${results.brand}</h1>
    <p style="color:#555;font-size:14px;">${results.scenario}</p>
    <p style="font-size:12px;color:#888;">45 agents · 3 cohorts · 30 simulated days · Generated by Lewis 1.5 · lewis.works</p>
  </div>
  ${cohortHtml}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center;">
    Generated by Lewsearch · lewis.works · Swarmgram LLC · hi@swarmgram.com
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),300);</script>
  </body></html>`;
}

export default function RunPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#08080E] flex items-center justify-center text-white">Loading…</div>}>
    <RunPageContent />
  </Suspense>;
}
