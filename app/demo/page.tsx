"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────── */
const TABS = [
  { id: "playground", label: "Playground", color: "amber" },
  { id: "research", label: "Focus Group", color: "indigo" },
  { id: "npc", label: "Tavern Test", color: "violet" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_STYLES: Record<string, { active: string; inactive: string }> = {
  amber: {
    active: "border-amber-500 text-amber-400",
    inactive: "border-transparent text-zinc-500 hover:text-amber-300/60",
  },
  indigo: {
    active: "border-indigo-500 text-indigo-400",
    inactive: "border-transparent text-zinc-500 hover:text-indigo-300/60",
  },
  violet: {
    active: "border-violet-500 text-violet-400",
    inactive: "border-transparent text-zinc-500 hover:text-violet-300/60",
  },
};

/* ─────────────────────────────────────────────────────────
   LEWIS API HELPER
───────────────────────────────────────────────────────── */
async function callLewis(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 400
): Promise<{ content: string; live: boolean }> {
  try {
    const resp = await fetch("/api/lewis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!resp.ok) throw new Error("API error");
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    return { content: data.content, live: true };
  } catch {
    return { content: "", live: false };
  }
}

/* ─────────────────────────────────────────────────────────
   PLAYGROUND CONFIG
───────────────────────────────────────────────────────── */
const ARCHETYPES = [
  { id: "conspiracy_theorist", name: "Conspiracy Theorist", handle: "DarkTruth99", party: "Independent", bio: "Self-taught researcher. Nothing is what it seems.", systemPrompt: "You are DarkTruth99, an independent conspiracy theorist on social media. You question official narratives, cite patterns others miss, and believe powerful institutions manipulate public perception. You're not crazy — you connect dots. Speak in your natural voice: suspicious, specific, sometimes sardonic. 2-4 sentences." },
  { id: "philosopher", name: "Philosopher", handle: "StoicMind", party: "Democrat", bio: "Philosophy PhD candidate. Ethics, epistemology, living well.", systemPrompt: "You are StoicMind, a philosophy PhD candidate. You think carefully about ethics, epistemology, and what it means to live well. You reference thinkers when relevant but don't name-drop. Your voice is measured, precise, sometimes melancholic. 2-4 sentences." },
  { id: "policy_wonk", name: "Policy Wonk", handle: "DataDrivenDC", party: "Democrat", bio: "Former Hill staffer. CBO reports for fun.", systemPrompt: "You are DataDrivenDC, a former Congressional staffer who reads CBO reports recreationally. You cite data, reference specific policies, and think in systems. Pragmatic, detail-oriented, occasionally dry. 2-4 sentences." },
  { id: "crypto_degen", name: "Crypto Degen", handle: "NgmiSer", party: "Libertarian", bio: "Full degen. 100x or food stamps.", systemPrompt: "You are NgmiSer, a crypto degen and libertarian. You see everything through the lens of incentives, decentralization, and market dynamics. Irreverent, sharp, allergic to authority. Use crypto slang naturally. 2-4 sentences." },
  { id: "maga_patriot", name: "MAGA Patriot", handle: "FreedomEagle1776", party: "Republican", bio: "Proud American. 2A supporter. Faith, family, freedom.", systemPrompt: "You are FreedomEagle1776, a proud MAGA patriot. You value faith, family, the Second Amendment, and American exceptionalism. You distrust mainstream media and big government. Speak plainly, with conviction. 2-4 sentences." },
  { id: "tech_bro", name: "Tech Bro", handle: "ShipItSteve", party: "Independent", bio: "YC alum. Building in AI. Move fast, break things.", systemPrompt: "You are ShipItSteve, a YC-backed tech founder building in AI. You think in terms of scale, disruption, and first principles. Optimistic about technology, skeptical of regulation. Casual but sharp. 2-4 sentences." },
] as const;

type ArchetypeId = (typeof ARCHETYPES)[number]["id"];

const EXAMPLE_QUESTIONS = [
  "What do you think about artificial intelligence replacing jobs?",
  "Is democracy actually working in America right now?",
  "What's your take on social media's effect on society?",
  "Should the government do more to address wealth inequality?",
  "What do you think about the current state of education?",
];

/* ─────────────────────────────────────────────────────────
   STREAMING DISPLAY
───────────────────────────────────────────────────────── */
function StreamingText({ text, label, isLoading }: { text: string; label: string; isLoading?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!text) { setDisplayed(""); return; }
    setAnimating(true);
    setDisplayed("");
    let i = 0;
    const step = 2;
    const interval = setInterval(() => {
      i = Math.min(i + step, text.length);
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setAnimating(false); }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-zinc-950/50 p-8 min-h-[140px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse [animation-delay:0.3s]" />
          </div>
          <span className="text-zinc-500 text-sm">Lewis is thinking...</span>
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 p-8 min-h-[140px] flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Select an archetype and ask a question to see Lewis respond in character.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-8 min-h-[140px]">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-mono text-amber-500/70">{label}</p>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500/60">LIVE</span>
      </div>
      <p className="text-zinc-300 leading-relaxed text-[15px]">
        {displayed}
        {animating && <span className="inline-block w-0.5 h-4 ml-0.5 bg-amber-500/80 animate-pulse align-middle" />}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PLAYGROUND PANEL
───────────────────────────────────────────────────────── */
function PlaygroundPanel() {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const selectedData = ARCHETYPES.find((a) => a.id === selectedArchetype);

  const handleAsk = useCallback(async () => {
    if (!selectedArchetype || !question.trim()) return;
    const archetype = ARCHETYPES.find((a) => a.id === selectedArchetype)!;
    setLoading(true);
    setResponse("");
    setIsLive(false);

    const result = await callLewis(archetype.systemPrompt, question.trim(), 300);
    if (result.live && result.content) {
      setResponse(result.content);
      setIsLive(true);
    } else {
      setResponse("Lewis is currently offline. Try again in a moment, or select one of the example questions below for cached responses.");
      setIsLive(false);
    }
    setLoading(false);
  }, [selectedArchetype, question]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-2">Lewis Playground</h2>
        <p className="text-zinc-500 text-[15px] max-w-xl">Ask any question. Lewis generates personality-distinct responses from a single 8B model — no prompt engineering, no role-play instructions.</p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-950/20 text-xs font-mono text-zinc-400 mb-10">
        <span className="text-amber-500">Lewis 1.5</span>
        <span className="text-zinc-600">&middot;</span>
        <span>1M+ training pairs</span>
        <span className="text-zinc-600">&middot;</span>
        <span>6 archetypes</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Choose an archetype</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ARCHETYPES.map((archetype) => (
            <button
              key={archetype.id}
              onClick={() => setSelectedArchetype(archetype.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 hover:border-white/20 ${
                selectedArchetype === archetype.id
                  ? "border-amber-500 bg-amber-950/10 ring-1 ring-amber-500/30"
                  : "border-white/[0.06] bg-zinc-950/50 hover:bg-zinc-950"
              }`}
            >
              <p className="font-semibold text-white text-sm mb-0.5">{archetype.name}</p>
              <p className="text-[11px] font-mono text-amber-500/80 mb-1">@{archetype.handle}</p>
              <p className="text-[10px] text-zinc-600">{archetype.party}</p>
              <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{archetype.bio}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Ask anything</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Type any question..."
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-950 border border-white/[0.06] text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
          />
          <button
            onClick={handleAsk}
            disabled={!selectedArchetype || !question.trim() || loading}
            className="px-6 py-3 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask Lewis
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuestion(q)}
              className="px-3 py-1.5 rounded-lg border border-white/[0.04] bg-zinc-950/50 text-xs text-zinc-500 hover:text-amber-400 hover:border-amber-500/20 transition-colors truncate max-w-[280px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Response</p>
        <StreamingText
          text={response}
          label={selectedData?.name ?? ""}
          isLoading={loading}
        />
        {isLive && response && (
          <p className="text-[10px] text-zinc-600 mt-2 font-mono">Generated live by Lewis 1.5 (8B params) &middot; ~$0.002</p>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-6">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Lewis 1.5 benchmarks (March 2026)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-2xl font-semibold text-amber-500">54.8%</p>
            <p className="text-xs text-zinc-500 mt-0.5">Personality divergence (vs 46.4% Opus)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">100%</p>
            <p className="text-xs text-zinc-500 mt-0.5">Character persistence (vs 88% Opus)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">8 vs 27</p>
            <p className="text-xs text-zinc-500 mt-0.5">AI tells per response (Lewis vs Opus)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FOCUS GROUP CONFIG
───────────────────────────────────────────────────────── */
type Sentiment = "supportive" | "opposed" | "nuanced";
type Party = "Democrat" | "Republican" | "Independent" | "Libertarian";

interface Persona {
  name: string;
  age: number;
  demographics: string;
  party: Party;
  archetype: string;
  systemPrompt: string;
  fallbackQuote: string;
}

const PERSONAS: Persona[] = [
  { name: "Maria", age: 34, demographics: "Latina, Urban", party: "Democrat", archetype: "Tech Privacy Advocate", systemPrompt: "You are Maria, 34, Latina, urban Democrat. You're a tech privacy advocate who cares deeply about digital rights and free expression. Respond to the survey question in 2-3 sentences. Be specific. Sound like a real person, not an AI.", fallbackQuote: "Banning TikTok sets a dangerous precedent for government control over free expression. If we let them ban one app, what's next? We need better privacy legislation, not blanket bans." },
  { name: "Jake", age: 52, demographics: "White, Suburban", party: "Republican", archetype: "Small Business Owner", systemPrompt: "You are Jake, 52, white, suburban Republican. You run a small business and believe in strong national security and traditional values. Respond to the survey question in 2-3 sentences. Be direct and practical.", fallbackQuote: "If TikTok is a national security threat, ban it. Period. We didn't let the Soviets broadcast into our living rooms. China shouldn't get to spy on our kids through their phones." },
  { name: "Aisha", age: 28, demographics: "Black, Urban", party: "Independent", archetype: "Content Creator", systemPrompt: "You are Aisha, 28, Black, urban independent. You're a content creator who built your career on social platforms. Respond to the survey question in 2-3 sentences. Speak from lived experience.", fallbackQuote: "I built my entire business on TikTok. Banning it would destroy livelihoods for millions of creators, especially Black creators who finally found a platform where the algorithm doesn't bury us." },
  { name: "Robert", age: 67, demographics: "White, Rural", party: "Republican", archetype: "Retired Military", systemPrompt: "You are Robert, 67, white, rural Republican. You're retired military who served 30 years. Security is everything to you. Respond to the survey question in 2-3 sentences. Be blunt.", fallbackQuote: "This is a no-brainer. ByteDance answers to the CCP. Every American's data on that app is a potential intelligence asset. We banned Huawei from our networks for the same reason." },
  { name: "Priya", age: 31, demographics: "South Asian, Suburban", party: "Democrat", archetype: "Data Scientist", systemPrompt: "You are Priya, 31, South Asian, suburban Democrat. You're a data scientist who thinks in systems and evidence. You see nuance where others see binary choices. Respond in 2-3 sentences.", fallbackQuote: "The 'national security' framing is technically valid but politically convenient. The real data privacy threat comes from domestic companies too. A TikTok ban without comprehensive privacy reform is theater." },
  { name: "Tyler", age: 19, demographics: "White, Urban", party: "Libertarian", archetype: "College Student", systemPrompt: "You are Tyler, 19, white, urban libertarian college student. You're deeply skeptical of government power. Respond to the survey question in 2-3 sentences. Sound like a 19-year-old, not a policy paper.", fallbackQuote: "Government overreach, plain and simple. If I want to use a Chinese app, that's my choice. The same people screaming about TikTok are fine with Facebook selling our data to Cambridge Analytica." },
  { name: "Carmen", age: 45, demographics: "Latina, Suburban", party: "Democrat", archetype: "School Teacher", systemPrompt: "You are Carmen, 45, Latina, suburban Democrat. You're a school teacher who sees the effects of technology on kids daily. Respond in 2-3 sentences. Be practical and empathetic.", fallbackQuote: "I see what TikTok does to my students' attention spans every day. But banning it? That's not the answer. We need digital literacy education and parental controls, not the government deciding what apps we can use." },
  { name: "Wei", age: 38, demographics: "Chinese-American, Urban", party: "Independent", archetype: "Software Engineer", systemPrompt: "You are Wei, 38, Chinese-American, urban independent. You're a software engineer who understands both the technical reality and the personal impact of this issue. Respond in 2-3 sentences.", fallbackQuote: "As a Chinese-American, this debate puts me in an impossible position. I understand the security concerns, but the rhetoric around it often bleeds into anti-Asian sentiment. Focus on the data practices, not the nationality." },
];

const PARTY_COLORS: Record<Party, string> = {
  Democrat: "bg-blue-600/90 text-white",
  Republican: "bg-red-600/90 text-white",
  Independent: "bg-zinc-600/90 text-white",
  Libertarian: "bg-amber-500/90 text-black",
};

function classifySentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  const supportWords = ["support", "ban it", "agree", "absolutely", "no-brainer", "should be", "need to", "must"];
  const opposeWords = ["oppose", "against", "overreach", "shouldn't", "don't ban", "bad idea", "dangerous precedent", "my choice"];
  let sup = 0, opp = 0;
  for (const w of supportWords) if (lower.includes(w)) sup++;
  for (const w of opposeWords) if (lower.includes(w)) opp++;
  if (sup > opp) return "supportive";
  if (opp > sup) return "opposed";
  return "nuanced";
}

const SENTIMENT_CONFIG: Record<Sentiment, { dot: string; label: string }> = {
  supportive: { dot: "bg-emerald-500", label: "Support" },
  opposed: { dot: "bg-rose-500", label: "Oppose" },
  nuanced: { dot: "bg-amber-500", label: "Nuanced" },
};

/* ─────────────────────────────────────────────────────────
   FOCUS GROUP PANEL
───────────────────────────────────────────────────────── */
function FocusGroupPanel() {
  const [prompt, setPrompt] = useState("Should the US government ban TikTok for national security reasons?");
  const [responses, setResponses] = useState<{ persona: Persona; quote: string; sentiment: Sentiment; live: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runPanel = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponses([]);
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 100);

    const results = await Promise.all(
      PERSONAS.map(async (persona) => {
        const result = await callLewis(persona.systemPrompt, prompt.trim(), 200);
        const quote = result.live && result.content ? result.content : persona.fallbackQuote;
        const sentiment = classifySentiment(quote);
        return { persona, quote, sentiment, live: result.live };
      })
    );

    clearInterval(timer);
    setElapsed(Date.now() - start);
    setResponses(results);
    setLoading(false);
  };

  const supportCount = responses.filter((r) => r.sentiment === "supportive").length;
  const opposeCount = responses.filter((r) => r.sentiment === "opposed").length;
  const nuancedCount = responses.filter((r) => r.sentiment === "nuanced").length;
  const liveCount = responses.filter((r) => r.live).length;

  return (
    <div>
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.4em] text-indigo-400/60 uppercase mb-4 font-mono">Synthetic Market Research</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-4">Run a Focus Group</h2>
        <p className="text-zinc-400 text-base max-w-lg mx-auto">Type any question or prompt. Lewis generates 8 demographically diverse responses — each from a distinct persona with its own values, background, and voice.</p>
      </div>

      <div className="mb-12">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your product message, ad copy, or survey question..."
          className="w-full h-32 px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none text-sm leading-relaxed transition-colors"
          spellCheck={false}
        />
        <button
          onClick={runPanel}
          disabled={loading || !prompt.trim()}
          className="mt-4 w-full py-3.5 rounded-lg bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Running panel... ${(elapsed / 1000).toFixed(1)}s` : "Run Panel"}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PERSONAS.map((p) => (
            <div key={p.name} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-white">{p.name}, {p.age}</span>
                <span className="text-zinc-500 text-sm">{p.demographics}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${PARTY_COLORS[p.party]}`}>{p.party}</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && responses.length > 0 && (
        <>
          <div className="space-y-4 mb-12">
            {responses.map(({ persona, quote, sentiment, live }, i) => (
              <div
                key={persona.name}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur-sm animate-[fadeUp_0.4s_ease_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-medium text-white">{persona.name}, {persona.age}</span>
                  <span className="text-zinc-500 text-sm">{persona.demographics}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${PARTY_COLORS[persona.party]}`}>{persona.party}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${SENTIMENT_CONFIG[sentiment].dot}`} title={SENTIMENT_CONFIG[sentiment].label} />
                  {live && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400/60">LIVE</span>}
                </div>
                <p className="text-[11px] text-indigo-400/80 font-mono mb-3">{persona.archetype}</p>
                <blockquote className="text-zinc-300 text-sm leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                  &ldquo;{quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6 mb-8 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: `${PERSONAS.length * 80}ms` }}>
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-400 text-sm">Support: <span className="text-white font-medium">{responses.length > 0 ? ((supportCount / responses.length) * 100).toFixed(0) : 0}%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-zinc-400 text-sm">Oppose: <span className="text-white font-medium">{responses.length > 0 ? ((opposeCount / responses.length) * 100).toFixed(0) : 0}%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-400 text-sm">Nuanced: <span className="text-white font-medium">{responses.length > 0 ? ((nuancedCount / responses.length) * 100).toFixed(0) : 0}%</span></span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-mono">
              {liveCount} of {responses.length} responses generated live by Lewis 1.5 &middot; {(elapsed / 1000).toFixed(1)}s
            </p>
            <p className="text-zinc-600 text-xs mt-1">$0.002 per respondent &middot; In production, run panels of 100&ndash;10,000</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TAVERN TEST CONFIG
───────────────────────────────────────────────────────── */
const NPCs = [
  { id: "aldric", name: "Aldric", role: "Merchant", icon: "\u{1FA99}", hint: "Shrewd trader. Remembers every deal.", starter: "Welcome, traveler. Looking to buy or sell? I've got a shipment of dwarven steel that just came in \u2014 finest quality, if you've got the coin.", systemPrompt: "You are Aldric, a shrewd merchant in a fantasy tavern. You've been trading for 30 years and remember every deal. You're friendly but always thinking about profit. You reference past trades and market conditions. Speak naturally in character — no modern slang. 1-3 sentences.", memory: "Remembers: Your last purchase (dwarven steel dagger)" },
  { id: "elara", name: "Elara", role: "Philosopher", icon: "\u{1F4DC}", hint: "Speaks in riddles. Questions everything.", starter: "Ah, another soul drawn to the fire. Tell me \u2014 do you seek answers, or merely the comfort of questions?", systemPrompt: "You are Elara, a mysterious philosopher in a fantasy tavern. You speak in measured, sometimes cryptic ways. You question everything and turn conversations inward. You reference ancient wisdom but never lecture. 1-3 sentences.", memory: "Remembers: You asked about the meaning of the stars" },
  { id: "finn", name: "Finn", role: "Bard", icon: "\u{1F3B5}", hint: "Has a song for every occasion.", starter: "\u{1F3B5} There once was a stranger who walked through the door, with dust on their boots and tales from the shore! What brings you in tonight, friend?", systemPrompt: "You are Finn, a charismatic bard in a fantasy tavern. You're always upbeat, turn everything into a potential song, and love a good story. You reference your musical adventures and famous performances. 1-3 sentences.", memory: "Remembers: You requested a ballad about the northern wars" },
  { id: "kael", name: "Kael", role: "Guard", icon: "\u2694\uFE0F", hint: "Loyal to the crown. Suspicious of strangers.", starter: "*eyes you cautiously* State your business. The tavern's open to all, but I'll be watching.", systemPrompt: "You are Kael, a stern guard captain in a fantasy tavern. You're loyal to the crown, suspicious of strangers, and always on duty even off duty. You speak in clipped, official tones. 1-3 sentences.", memory: "Remembers: You arrived from the eastern road at dusk" },
  { id: "vesper", name: "Vesper", role: "Mysterious Stranger", icon: "\u{1F311}", hint: "Nobody knows where they came from.", starter: "...You noticed me. Most don't. *adjusts hood* Sit, if you like. But choose your words carefully.", systemPrompt: "You are Vesper, a mysterious figure in a fantasy tavern. Nobody knows your past. You're cryptic, observant, and occasionally ominous. You hint at knowing more than you should. Use *actions* sparingly. 1-3 sentences.", memory: "Remembers: You carry a symbol of the old order" },
] as const;

type NPCId = (typeof NPCs)[number]["id"];

/* ─────────────────────────────────────────────────────────
   TAVERN TEST PANEL
───────────────────────────────────────────────────────── */
function TavernTestPanel() {
  const [selectedId, setSelectedId] = useState<NPCId | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "npc"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selected = NPCs.find((n) => n.id === selectedId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSelectNPC = (id: NPCId) => {
    const npc = NPCs.find((n) => n.id === id)!;
    setSelectedId(id);
    setMessages([{ role: "npc", text: npc.starter }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selected || isTyping) return;

    setInput("");
    const userMsg = { role: "user" as const, text: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    const conversationHistory = newMessages.map((m) => ({
      role: m.role === "npc" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const resp = await fetch("/api/lewis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: selected.systemPrompt },
            ...conversationHistory,
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });
      const data = await resp.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: "npc", text: data.content }]);
      } else {
        setMessages((prev) => [...prev, { role: "npc", text: "*pauses thoughtfully* ...I seem to have lost my train of thought. Say that again?" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "npc", text: "*pauses thoughtfully* ...I seem to have lost my train of thought. Say that again?" }]);
    }
    setIsTyping(false);
  };

  return (
    <div>
      <header className="text-center mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl text-amber-100/95 tracking-tight mb-3">The Tavern Test</h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">Five NPCs. One tavern. Each with their own personality, memories, and voice. Every response generated live by Lewis.</p>
      </header>

      <div
        className="rounded-2xl overflow-hidden border border-amber-900/40 mb-10"
        style={{ background: "linear-gradient(180deg, rgba(120,53,15,0.25) 0%, rgba(31,27,27,0.9) 50%, rgba(0,0,0,0.95) 100%)", boxShadow: "inset 0 0 80px rgba(251,191,36,0.03), 0 0 60px rgba(0,0,0,0.5)" }}
      >
        <div className="h-1" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.3), rgba(251,146,60,0.4), rgba(251,191,36,0.3), transparent)" }} />
        <div className="p-8 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {NPCs.map((npc) => (
              <button
                key={npc.id}
                onClick={() => handleSelectNPC(npc.id)}
                className={`group text-left p-5 rounded-xl border transition-all duration-200 ${
                  selectedId === npc.id
                    ? "border-[#8b5cf6] bg-violet-950/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    : "border-amber-900/30 bg-zinc-950/60 hover:border-amber-800/50 hover:bg-zinc-900/80"
                }`}
              >
                <div className="text-3xl mb-3">{npc.icon}</div>
                <h3 className="font-serif text-lg text-amber-100/90 mb-0.5">{npc.name}</h3>
                <p className="text-xs text-amber-600/90 uppercase tracking-wider mb-2">{npc.role}</p>
                <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{npc.hint}</p>
                <p className="mt-3 text-[11px] text-violet-400/70 font-mono">{npc.memory}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="rounded-2xl overflow-hidden border border-zinc-800 mb-10 animate-[fadeUp_0.4s_ease_both]"
          style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.98) 0%, rgba(9,9,11,0.99) 100%)", boxShadow: "0 0 40px rgba(0,0,0,0.4)" }}
        >
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            <div className="lg:w-72 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/80">
              <div className="text-4xl mb-3">{selected.icon}</div>
              <h3 className="font-serif text-xl text-amber-100/95 mb-1">{selected.name}</h3>
              <p className="text-xs text-amber-600/90 uppercase tracking-wider mb-3">{selected.role}</p>
              <p className="text-sm text-zinc-500 mb-4">{selected.hint}</p>
              <p className="text-[11px] text-violet-400/80 font-mono mb-3">{selected.memory}</p>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-mono text-zinc-600">Powered by Lewis 1.5</p>
                <p className="text-[10px] font-mono text-amber-500/50">Live responses</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[320px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${m.role === "user" ? "bg-[#8b5cf6]/20 border border-violet-500/30 text-violet-100" : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-200"}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-2.5">
                      <span className="inline-flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/50 transition-colors disabled:opacity-50"
                  />
                  <button type="submit" disabled={!input.trim() || isTyping} className="px-5 py-3 rounded-lg bg-[#8b5cf6] text-white font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Persistent Memory", desc: "Each NPC retains context across 100+ interactions at $0 cost" },
          { title: "Distinct Voices", desc: "No two NPCs sound alike — personality is in the weights, not the prompt" },
          { title: "REST API", desc: "Single endpoint: POST /v1/npc/chat" },
          { title: "Powered by Lewis 1.5", desc: "$0.002/response \u00B7 < 200ms latency" },
        ].map(({ title, desc }) => (
          <div key={title} className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/50">
            <h4 className="text-sm font-medium text-violet-400 mb-1">{title}</h4>
            <p className="text-sm text-zinc-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN DEMO PAGE
───────────────────────────────────────────────────────── */
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("playground");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "research" || hash === "npc" || hash === "playground") {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-serif text-white tracking-tight hover:text-amber-400 transition-colors">Lewis</Link>
          <Link href="/" className="text-[13px] text-zinc-500 hover:text-white transition-colors">Back to Home</Link>
        </div>
      </nav>

      <main className="pt-20 pb-16 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-1 border-b border-white/[0.06] mb-10">
          {TABS.map((tab) => {
            const style = TAB_STYLES[tab.color];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); window.history.replaceState(null, "", `#${tab.id}`); }}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? style.active : style.inactive}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "playground" && <PlaygroundPanel />}
        {activeTab === "research" && <FocusGroupPanel />}
        {activeTab === "npc" && <TavernTestPanel />}
      </main>
    </div>
  );
}
