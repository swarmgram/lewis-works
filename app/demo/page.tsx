"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface AgentSummary {
  id: string;
  username: string;
  archetype: string;
  sub_personality: string | null;
  mbti_type: string;
  bio: string;
  age: number;
  location_type: string;
  region: string;
  big5_openness: number;
  big5_conscientiousness: number;
  big5_extraversion: number;
  big5_agreeableness: number;
  big5_neuroticism: number;
  post_count: number;
  belief_count: number;
  beliefs: string[];
  identity: Record<string, unknown>;
}

interface AgentFull extends AgentSummary {
  system_prompt: string;
  personal_memory: string;
  semantic_memory: string;
  memory_facts: Record<string, unknown>;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

/* ─────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────── */
const TABS = [
  { id: "playground", label: "Playground", color: "amber" },
  { id: "chat", label: "Chat", color: "emerald" },
  { id: "research", label: "Focus Group", color: "indigo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_STYLES: Record<string, { active: string; inactive: string }> = {
  amber: {
    active: "border-amber-500 text-amber-400",
    inactive: "border-transparent text-zinc-500 hover:text-amber-300/60",
  },
  emerald: {
    active: "border-emerald-500 text-emerald-400",
    inactive: "border-transparent text-zinc-500 hover:text-emerald-300/60",
  },
  indigo: {
    active: "border-indigo-500 text-indigo-400",
    inactive: "border-transparent text-zinc-500 hover:text-indigo-300/60",
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

async function callLewisMultiturn(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  maxTokens = 300
): Promise<{ content: string; live: boolean }> {
  try {
    const resp = await fetch("/api/lewis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
   SHARE HELPERS
───────────────────────────────────────────────────────── */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function shareToX(text: string, url?: string) {
  const params = new URLSearchParams({ text });
  if (url) params.set("url", url);
  window.open(`https://twitter.com/intent/tweet?${params}`, "_blank");
}

async function saveConversation(
  type: string,
  agentIds: string[],
  messages: unknown[],
  topic?: string
): Promise<string | null> {
  try {
    const resp = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, agent_ids: agentIds, messages, topic }),
    });
    const data = await resp.json();
    return data.id || null;
  } catch {
    return null;
  }
}

function ShareButtons({
  onCopy,
  onShareX,
  onPermalink,
  copied,
  saved,
}: {
  onCopy: () => void;
  onShareX: () => void;
  onPermalink?: () => void;
  copied: boolean;
  saved?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            Copy
          </>
        )}
      </button>
      <button
        onClick={onShareX}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        Share
      </button>
      {onPermalink && (
        <button
          onClick={onPermalink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          {saved ? "Link copied!" : "Permalink"}
        </button>
      )}
    </div>
  );
}

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
   BIG FIVE BAR
───────────────────────────────────────────────────────── */
function Big5Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{(value * 100).toFixed(0)}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-[10px] text-zinc-600 w-[4.5rem] truncate">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STATS TICKER
───────────────────────────────────────────────────────── */
function StatsTicker() {
  const [stats, setStats] = useState<{ agents: number; posts: number; comments: number } | null>(null);
  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;
  return (
    <div className="flex items-center justify-center gap-6 py-3 mb-6 border-b border-white/[0.04]">
      {[
        { value: stats.agents.toLocaleString(), label: "agents" },
        { value: stats.posts.toLocaleString(), label: "posts" },
        { value: stats.comments.toLocaleString(), label: "comments" },
      ].map(({ value, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white tabular-nums">{value}</span>
          <span className="text-[11px] text-zinc-600">{label}</span>
        </div>
      ))}
      <span className="text-[10px] text-emerald-500/60 font-mono flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE
      </span>
    </div>
  );
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
   PLAYGROUND PANEL
───────────────────────────────────────────────────────── */
function PlaygroundPanel() {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setResponse("Lewis is currently offline. Try again in a moment.");
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
        <StreamingText text={response} label={selectedData?.name ?? ""} isLoading={loading} />
        {isLive && response && (
          <>
          <p className="text-[10px] text-zinc-600 mt-2 font-mono">Generated live by Lewis 1.5 (8B params) &middot; ~$0.002</p>
            <ShareButtons
              copied={copied}
              onCopy={async () => {
                const text = `@${selectedData?.handle}: "${response}"\n\nAsked: "${question}"\nGenerated by Lewis 1.5 — lewis.works/demo`;
                const ok = await copyToClipboard(text);
                if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
              }}
              onShareX={() => {
                shareToX(
                  `I asked a Lewis AI agent "${question.slice(0, 80)}..."\n\n@${selectedData?.handle} (${selectedData?.name}) responded:\n\n"${response.slice(0, 180)}..."\n\nTry it yourself:`,
                  "https://lewis.works/demo"
                );
              }}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-6">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Lewis 1.5 benchmarks (March 2026)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div><p className="text-2xl font-semibold text-amber-500">54.8%</p><p className="text-xs text-zinc-500 mt-0.5">Personality divergence (vs 46.4% Opus)</p></div>
          <div><p className="text-2xl font-semibold text-white">100%</p><p className="text-xs text-zinc-500 mt-0.5">Character persistence (vs 88% Opus)</p></div>
          <div><p className="text-2xl font-semibold text-white">8 vs 27</p><p className="text-xs text-zinc-500 mt-0.5">AI tells per response (Lewis vs Opus)</p></div>
          </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CHAT PANEL — Real agents from Supabase with memory sidebar
───────────────────────────────────────────────────────── */
function ChatPanel() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentFull, setAgentFull] = useState<AgentFull | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAgents(data); })
      .catch(() => {})
      .finally(() => setLoadingAgents(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const selectAgent = async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setInput("");
    try {
      const r = await fetch(`/api/agents?id=${id}`);
      const data = await r.json();
      if (data.id) {
        setAgentFull({
          ...data,
          belief_count: Array.isArray(data.memory_facts?.beliefs) ? data.memory_facts.beliefs.length : 0,
          beliefs: data.memory_facts?.beliefs || [],
          identity: data.memory_facts?._identity || {},
        });
      }
    } catch {
      setAgentFull(null);
    }
  };

  const buildChatPrompt = (agent: AgentFull): string => {
    let prompt = agent.system_prompt || "";
    if (agent.personal_memory && agent.personal_memory.length > 50) {
      prompt += `\n\nYour memory:\n${agent.personal_memory.slice(0, 2000)}`;
    }
    prompt += "\n\nRespond in 2-4 sentences. Stay in character. Be specific and opinionated.";
    return prompt;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !agentFull || isTyping) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    const chatHistory = newMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

    const result = await callLewisMultiturn(buildChatPrompt(agentFull), chatHistory, 300);
    if (result.live && result.content) {
      setMessages((prev) => [...prev, { role: "assistant", text: result.content }]);
    } else {
      setMessages((prev) => [...prev, { role: "assistant", text: "Lewis is currently offline. Try again in a moment." }]);
    }
    setIsTyping(false);
  };

  const filteredAgents = agents.filter((a) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      a.username.toLowerCase().includes(s) ||
      a.archetype.toLowerCase().includes(s) ||
      (a.sub_personality || "").toLowerCase().includes(s) ||
      a.bio.toLowerCase().includes(s)
    );
  });

  const formatConversation = () => {
    if (!agentFull || messages.length === 0) return "";
    let text = `Chat with @${agentFull.username} (${agentFull.archetype})\n`;
    text += `${agentFull.bio}\n\n`;
    for (const m of messages) {
      text += m.role === "user" ? `You: ${m.text}\n\n` : `@${agentFull.username}: ${m.text}\n\n`;
    }
    text += "---\nPowered by Lewis 1.5 — lewis.works/demo";
    return text;
  };

  const identityData = agentFull?.identity as Record<string, string | string[]> | undefined;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-2">Chat with a Real Agent</h2>
        <p className="text-zinc-500 text-[15px] max-w-xl">
          These are real agents from our 10,000-agent simulation. Each has accumulated memories, formed beliefs, and developed a unique personality over 30 simulated days. The memory sidebar shows their actual internal state.
        </p>
      </div>

      {!selectedId ? (
        <>
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by archetype, username, or bio..."
              className="w-full max-w-md px-4 py-2.5 rounded-lg bg-zinc-950 border border-white/[0.06] text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
            />
          </div>

          {loadingAgents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.04] bg-zinc-950/50 p-4 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAgents.map((agent) => (
        <button
                  key={agent.id}
                  onClick={() => selectAgent(agent.id)}
                  className="text-left p-4 rounded-xl border border-white/[0.06] bg-zinc-950/50 hover:bg-zinc-900/80 hover:border-emerald-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{agent.archetype}</p>
                    <span className="text-[10px] text-zinc-600 font-mono">{agent.post_count} posts</span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-500/70 mb-1">@{agent.username}</p>
                  {agent.sub_personality && (
                    <p className="text-[10px] text-zinc-600 mb-1">{agent.sub_personality} &middot; {agent.mbti_type}</p>
                  )}
                  {!agent.sub_personality && (
                    <p className="text-[10px] text-zinc-600 mb-1">{agent.mbti_type} &middot; {agent.age}yo &middot; {agent.location_type} {agent.region}</p>
                  )}
                  <p className="text-xs text-zinc-500 line-clamp-2">{agent.bio}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {agent.belief_count > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-500/60">
                        {agent.belief_count} beliefs
                      </span>
                    )}
                  </div>
        </button>
              ))}
      </div>
          )}
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Memory Sidebar */}
          <div className="lg:w-80 shrink-0">
            <button
              onClick={() => { setSelectedId(null); setAgentFull(null); setMessages([]); }}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors mb-4"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to all agents
            </button>

            {agentFull ? (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <div>
                  <h3 className="font-serif text-xl text-white mb-0.5">{agentFull.archetype}</h3>
                  <p className="text-xs font-mono text-emerald-500/70">@{agentFull.username}</p>
                  {agentFull.sub_personality && <p className="text-xs text-zinc-500 mt-1">{agentFull.sub_personality}</p>}
                  <p className="text-sm text-zinc-400 mt-2">{agentFull.bio}</p>
              </div>

                <div className="border-t border-white/[0.04] pt-4">
                  <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Profile</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-zinc-600">MBTI</span> <span className="text-white ml-1">{agentFull.mbti_type}</span></div>
                    <div><span className="text-zinc-600">Age</span> <span className="text-white ml-1">{agentFull.age}</span></div>
                    <div><span className="text-zinc-600">Location</span> <span className="text-white ml-1 capitalize">{agentFull.location_type}</span></div>
                    <div><span className="text-zinc-600">Region</span> <span className="text-white ml-1 capitalize">{agentFull.region}</span></div>
                    {typeof identityData?.party_id === "string" && identityData.party_id && (
                      <div className="col-span-2"><span className="text-zinc-600">Political</span> <span className="text-white ml-1 capitalize">{identityData.party_id.replace(/_/g, " ")}</span></div>
                    )}
                    {typeof identityData?.institutional_trust === "string" && identityData.institutional_trust && (
                      <div className="col-span-2"><span className="text-zinc-600">Inst. Trust</span> <span className="text-white ml-1 capitalize">{identityData.institutional_trust}</span></div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/[0.04] pt-4">
                  <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-3">Personality (Big Five)</p>
              <div className="space-y-2">
                    <Big5Bar label="Open" value={agentFull.big5_openness} color="bg-violet-500" />
                    <Big5Bar label="Consc" value={agentFull.big5_conscientiousness} color="bg-blue-500" />
                    <Big5Bar label="Extra" value={agentFull.big5_extraversion} color="bg-amber-500" />
                    <Big5Bar label="Agree" value={agentFull.big5_agreeableness} color="bg-emerald-500" />
                    <Big5Bar label="Neuro" value={agentFull.big5_neuroticism} color="bg-rose-500" />
              </div>
            </div>

                {Array.isArray(identityData?.top_issues) && identityData.top_issues.length > 0 && (
                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Top Issues</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(identityData.top_issues as string[]).map((issue) => (
                        <span key={issue} className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400">{issue}</span>
                      ))}
                    </div>
        </div>
      )}

                {agentFull.beliefs.length > 0 && (
                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Beliefs ({agentFull.beliefs.length})</p>
                    <div className="space-y-2">
                      {agentFull.beliefs.map((belief: string, i: number) => (
                        <p key={i} className="text-xs text-zinc-400 leading-relaxed pl-3 border-l border-emerald-500/20">
                          {belief}
                        </p>
                      ))}
                </div>
              </div>
                )}

                {typeof identityData?.formative_event === "string" && identityData.formative_event && (
                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Formative Experience</p>
                    <p className="text-xs text-zinc-400 italic">&ldquo;{identityData.formative_event}&rdquo;</p>
          </div>
                )}

                {agentFull.personal_memory && agentFull.personal_memory.length > 50 && (
                  <div className="border-t border-white/[0.04] pt-4">
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Memory</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {agentFull.personal_memory.slice(0, 600)}
                      {agentFull.personal_memory.length > 600 && "..."}
                    </p>
              </div>
                )}

                <div className="border-t border-white/[0.04] pt-3">
                  <p className="text-[10px] text-zinc-600 font-mono">{agentFull.post_count} posts in simulation &middot; Powered by Lewis 1.5</p>
              </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.04] bg-zinc-950/50 p-5 animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-4/5" />
            </div>
          </div>
      )}
    </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col rounded-xl border border-white/[0.06] bg-zinc-950 min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && agentFull && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-zinc-600 text-sm mb-3">Start a conversation with @{agentFull.username}</p>
                    <p className="text-zinc-700 text-xs max-w-sm">This agent has real memories and beliefs from 30 days of social simulation. Ask them anything — about their opinions, experiences, or beliefs shown in the sidebar.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    m.role === "user"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100"
                      : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-200"
                  }`}>
                    {m.role === "assistant" && agentFull && (
                      <p className="text-[10px] font-mono text-emerald-500/50 mb-1">@{agentFull.username}</p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-2.5">
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500/70 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/70 animate-pulse [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/70 animate-pulse [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/[0.06]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isTyping || !agentFull}
                  className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping || !agentFull}
                  className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>

            {messages.length >= 2 && (
              <div className="px-4 pb-4">
                <ShareButtons
                  copied={copied}
                  saved={saved}
                  onCopy={async () => {
                    const ok = await copyToClipboard(formatConversation());
                    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
                  }}
                  onShareX={() => {
                    shareToX(
                      `I just chatted with @${agentFull?.username}, a Lewis AI agent with persistent memory from a 10K-agent simulation.\n\nThey have ${agentFull?.beliefs.length || 0} accumulated beliefs and real memories from 30 days of social interaction.\n\nTry it yourself:`,
                      "https://lewis.works/demo#chat"
                    );
                  }}
                  onPermalink={async () => {
                    if (!agentFull) return;
                    const id = await saveConversation("chat", [agentFull.id], messages);
                    if (id) {
                      const url = `${window.location.origin}/demo?chat=${id}`;
                      await copyToClipboard(url);
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FOCUS GROUP — Belief Drift Workflow
───────────────────────────────────────────────────────── */
type Sentiment = "supportive" | "opposed" | "nuanced";

interface CohortAgent {
  id: string;
  username: string;
  archetype: string;
  sub_personality: string | null;
  mbti_type: string;
  bio: string;
  age: number;
  location_type: string;
  region: string;
  big5_openness: number;
  big5_agreeableness: number;
  system_prompt: string;
  personal_memory: string;
  beliefs: string[];
  identity: Record<string, string | string[]>;
}

interface CohortOption {
  id: string;
  label: string;
  description: string;
}

interface AgentResponse {
  agentId: string;
  quote: string;
  sentiment: Sentiment;
  live: boolean;
}

function classifySentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  const supportSignals = [/\bi (fully |strongly )?(support|agree|endorse|approve)\b/, /\byes[,. !]/, /\babsolutely\b(?!.*\bnot\b)/, /\b(great|good|positive|exciting|promising)\b/i, /\boptimistic\b/, /\bwelcome\b/];
  const opposeSignals = [/\bi (fully |strongly )?(oppose|disagree|reject)\b/, /\bno[,. !](?!.*\bbut yes\b)/, /\babsolutely not\b/, /\boverreach\b/, /\bbad idea\b/, /\bdangerous\b/, /\bshouldn't\b/, /\bshould not\b/, /\bdon't (think|believe|support|agree)\b/, /\bskeptical\b/, /\bconcerned\b/, /\bworried\b/, /\bnot (the answer|convinced|sure)\b/];

  let sup = 0, opp = 0;
  for (const r of supportSignals) if (r.test(lower)) sup++;
  for (const r of opposeSignals) if (r.test(lower)) opp++;

  if (sup > opp) return "supportive";
  if (opp > sup) return "opposed";
  return "nuanced";
}

const SENTIMENT_CONFIG: Record<Sentiment, { dot: string; label: string; color: string }> = {
  supportive: { dot: "bg-emerald-500", label: "Support", color: "text-emerald-400" },
  opposed: { dot: "bg-rose-500", label: "Oppose", color: "text-rose-400" },
  nuanced: { dot: "bg-amber-500", label: "Nuanced", color: "text-amber-400" },
};

const PARTY_DISPLAY: Record<string, string> = {
  strong_dem: "Strong Dem", lean_dem: "Lean Dem", ind_dem: "Ind (Dem)",
  independent: "Independent", apolitical: "Apolitical",
  ind_rep: "Ind (Rep)", lean_rep: "Lean Rep", strong_rep: "Strong Rep",
  other_party: "Other",
};

type FGStep = "setup" | "baseline" | "exposure" | "post_exposure" | "results";

function FocusGroupPanel() {
  const [step, setStep] = useState<FGStep>("setup");
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("national_mixed");
  const [agents, setAgents] = useState<CohortAgent[]>([]);
  const [question, setQuestion] = useState("How do you feel about companies using AI to replace customer service workers?");
  const [stimulus, setStimulus] = useState("");
  const [baselineResponses, setBaselineResponses] = useState<AgentResponse[]>([]);
  const [postResponses, setPostResponses] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCohort, setLoadingCohort] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/cohort?cohort=national_mixed")
      .then((r) => r.json())
      .then((data) => {
        if (data.agents) setAgents(data.agents);
        if (data.available_cohorts) setCohorts(data.available_cohorts);
      })
      .catch(() => {})
      .finally(() => setLoadingCohort(false));
  }, []);

  const loadCohort = async (cohortId: string) => {
    setSelectedCohort(cohortId);
    setLoadingCohort(true);
    try {
      const r = await fetch(`/api/cohort?cohort=${cohortId}`);
      const data = await r.json();
      if (data.agents) setAgents(data.agents);
    } catch { /* noop */ }
    setLoadingCohort(false);
  };

  const buildPrompt = (agent: CohortAgent, withStimulus?: string): string => {
    let prompt = agent.system_prompt || "";
    if (agent.personal_memory && agent.personal_memory.length > 50) {
      prompt += `\n\nYour memory:\n${agent.personal_memory.slice(0, 1500)}`;
    }
    if (withStimulus) {
      prompt += `\n\nRecent experience: You were shown the following message/advertisement:\n"${withStimulus}"\n\nThis is now part of your experience. It may have affected how you think about the topic, or it may not have. React authentically based on your personality and beliefs — if it conflicts with your values, push back. If it resonates, explain why. Don't pretend you haven't seen it.`;
    }
    prompt += "\n\nRespond to the survey question in 2-3 sentences. Be specific and speak in your own voice. Sound like a real person, not an AI.";
    return prompt;
  };

  const runBaseline = async () => {
    if (!question.trim() || agents.length === 0) return;
    setLoading(true);
    setBaselineResponses([]);
    setPostResponses([]);
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 100);

    const results = await Promise.all(
      agents.map(async (agent) => {
        const result = await callLewis(buildPrompt(agent), question.trim(), 200);
        return {
          agentId: agent.id,
          quote: result.content || "Agent is currently offline.",
          sentiment: classifySentiment(result.content || ""),
          live: result.live,
        };
      })
    );

    clearInterval(timer);
    setElapsed(Date.now() - start);
    setBaselineResponses(results);
    setStep("exposure");
    setLoading(false);
  };

  const runPostExposure = async () => {
    if (!stimulus.trim()) return;
    setLoading(true);
    setPostResponses([]);
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 100);

    const results = await Promise.all(
      agents.map(async (agent) => {
        const result = await callLewis(buildPrompt(agent, stimulus.trim()), question.trim(), 200);
        return {
          agentId: agent.id,
          quote: result.content || "Agent is currently offline.",
          sentiment: classifySentiment(result.content || ""),
          live: result.live,
        };
      })
    );

    clearInterval(timer);
    setElapsed(Date.now() - start);
    setPostResponses(results);
    setStep("results");
    setLoading(false);
  };

  const getSentimentScore = (s: Sentiment): number => s === "supportive" ? 1 : s === "opposed" ? -1 : 0;

  const driftData = agents.map((agent, i) => {
    const before = baselineResponses[i];
    const after = postResponses[i];
    if (!before || !after) return null;
    const beforeScore = getSentimentScore(before.sentiment);
    const afterScore = getSentimentScore(after.sentiment);
    const shifted = before.sentiment !== after.sentiment;
    return { agent, before, after, beforeScore, afterScore, shifted };
  }).filter(Boolean) as { agent: CohortAgent; before: AgentResponse; after: AgentResponse; beforeScore: number; afterScore: number; shifted: boolean }[];

  const shiftedCount = driftData.filter((d) => d.shifted).length;

  const formatResults = () => {
    let text = `Focus Group Study: "${question}"\nStimulus: "${stimulus}"\nCohort: ${cohorts.find((c) => c.id === selectedCohort)?.label || selectedCohort}\n\n`;
    text += "--- BEFORE/AFTER COMPARISON ---\n\n";
    for (const d of driftData) {
      text += `@${d.agent.username} (${d.agent.archetype}, ${d.agent.age}, ${d.agent.location_type} ${d.agent.region})\n`;
      text += `  Before: [${d.before.sentiment}] "${d.before.quote}"\n`;
      text += `  After:  [${d.after.sentiment}] "${d.after.quote}"\n`;
      text += `  Shift:  ${d.shifted ? "YES" : "No change"}\n\n`;
    }
    text += `---\n${shiftedCount} of ${driftData.length} agents shifted after exposure.\nPowered by Lewis 1.5 — lewis.works/demo`;
    return text;
  };

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.4em] text-indigo-400/60 uppercase mb-4 font-mono">Synthetic Market Research</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-4">Focus Group with Belief Drift</h2>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto">
          Ask a panel of real AI agents a question, expose them to your messaging, then re-ask. See which agents shift their opinion and which resist — powered by persistent personality and memory.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[
          { id: "setup" as const, label: "1. Setup" },
          { id: "baseline" as const, label: "2. Baseline" },
          { id: "exposure" as const, label: "3. Expose" },
          { id: "results" as const, label: "4. Results" },
        ].map((s, i) => {
          const stepOrder = ["setup", "baseline", "exposure", "post_exposure", "results"];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s.id);
          const active = thisIdx <= currentIdx;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-mono ${active ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-600"}`}>
                {s.label}
              </div>
              {i < 3 && <div className={`w-8 h-px ${active ? "bg-indigo-500/30" : "bg-zinc-800"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step: Setup */}
      {step === "setup" && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Select a cohort</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cohorts.map((c) => (
              <button
                  key={c.id}
                  onClick={() => loadCohort(c.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedCohort === c.id
                      ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/30"
                      : "border-white/[0.06] bg-zinc-950/50 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{c.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{c.description}</p>
              </button>
            ))}
        </div>
      </div>

          {!loadingCohort && agents.length > 0 && (
            <div>
              <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Panel ({agents.length} agents)</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {agents.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg border border-white/[0.04] bg-zinc-950/50 text-center">
                    <p className="text-[11px] font-mono text-indigo-400/70">@{a.username}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{a.archetype}</p>
                    <p className="text-[9px] text-zinc-600 mt-0.5">{a.age}, {a.location_type}</p>
                    {a.identity?.party_id && (
                      <p className="text-[9px] text-zinc-600">{PARTY_DISPLAY[a.identity.party_id as string] || String(a.identity.party_id)}</p>
                    )}
              </div>
                ))}
            </div>
            </div>
          )}

          <div>
            <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Your question</p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your survey question..."
              className="w-full h-24 px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none text-sm leading-relaxed"
              spellCheck={false}
            />
                    </div>

          <button
            onClick={() => { setStep("baseline"); runBaseline(); }}
            disabled={loading || !question.trim() || agents.length === 0}
            className="w-full py-3.5 rounded-lg bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Baseline Survey
          </button>
                  </div>
      )}

      {/* Step: Baseline results + Exposure input */}
      {(step === "baseline" || step === "exposure") && (
        <div className="space-y-8">
          {loading && step === "baseline" && (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.3s]" />
                    </div>
              </div>
              <p className="text-zinc-500 text-sm">Surveying {agents.length} agents... {(elapsed / 1000).toFixed(1)}s</p>
                  </div>
                )}

          {baselineResponses.length > 0 && (
            <>
              <div>
                <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Baseline Responses — &ldquo;{question.slice(0, 80)}{question.length > 80 ? "..." : ""}&rdquo;</p>
                <div className="space-y-3">
                  {agents.map((agent, i) => {
                    const resp = baselineResponses[i];
                    if (!resp) return null;
                    return (
                      <div key={agent.id} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-indigo-400/70">@{agent.username}</span>
                          <span className="text-[10px] text-zinc-500">{agent.archetype}, {agent.age}</span>
                          <span className={`w-2 h-2 rounded-full ${SENTIMENT_CONFIG[resp.sentiment].dot}`} />
                          <span className={`text-[10px] ${SENTIMENT_CONFIG[resp.sentiment].color}`}>{SENTIMENT_CONFIG[resp.sentiment].label}</span>
                          {resp.live && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400/60">LIVE</span>}
                        </div>
                        <blockquote className="text-zinc-300 text-sm leading-relaxed pl-3 border-l-2 border-indigo-500/20">
                          &ldquo;{resp.quote}&rdquo;
                        </blockquote>
                      </div>
                    );
                  })}
                </div>
              </div>

              {step === "exposure" && (
                <div className="max-w-2xl mx-auto rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-6 space-y-4">
                  <div>
                    <p className="text-xs font-mono text-indigo-400/60 tracking-widest uppercase mb-2">Step 3: Expose to stimulus</p>
                    <p className="text-zinc-400 text-sm">Paste your ad copy, product message, or any content you want to test. The agents will process it as a recent experience, then answer the same question again.</p>
                  </div>
                  <textarea
                    value={stimulus}
                    onChange={(e) => setStimulus(e.target.value)}
                    placeholder="Paste your ad copy, product messaging, or content here..."
                    className="w-full h-32 px-4 py-3 rounded-lg bg-zinc-950/80 border border-indigo-500/20 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none text-sm leading-relaxed"
                    spellCheck={false}
                  />
                  <button
                    onClick={() => { setStep("post_exposure"); runPostExposure(); }}
                    disabled={loading || !stimulus.trim()}
                    className="w-full py-3.5 rounded-lg bg-[#6366f1] hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Expose &amp; Re-Survey
                  </button>
                </div>
              )}
            </>
          )}

          {loading && step !== "baseline" && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.3s]" />
            </div>
          </div>
              <p className="text-zinc-500 text-sm">Re-surveying after exposure... {(elapsed / 1000).toFixed(1)}s</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Post-exposure loading */}
      {step === "post_exposure" && loading && (
        <div className="text-center py-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-pulse [animation-delay:0.3s]" />
          </div>
          </div>
          <p className="text-zinc-500 text-sm">Re-surveying after exposure... {(elapsed / 1000).toFixed(1)}s</p>
        </div>
      )}

      {/* Step: Results — Before/After Comparison */}
      {step === "results" && driftData.length > 0 && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-6">
            <div className="flex flex-wrap items-center gap-6 mb-3">
              <div>
                <p className="text-3xl font-bold text-white">{shiftedCount}<span className="text-zinc-500 text-lg">/{driftData.length}</span></p>
                <p className="text-xs text-zinc-500 mt-0.5">agents shifted after exposure</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                {(["supportive", "opposed", "nuanced"] as const).map((s) => {
                  const beforeCount = driftData.filter((d) => d.before.sentiment === s).length;
                  const afterCount = driftData.filter((d) => d.after.sentiment === s).length;
                  const diff = afterCount - beforeCount;
                  return (
                    <div key={s}>
                      <p className="text-xs text-zinc-600 mb-1">{SENTIMENT_CONFIG[s].label}</p>
                      <p className="text-sm text-white">{beforeCount} → {afterCount}
                        {diff !== 0 && <span className={`ml-1 text-xs ${diff > 0 ? "text-emerald-400" : "text-rose-400"}`}>{diff > 0 ? "+" : ""}{diff}</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono">Stimulus: &ldquo;{stimulus.slice(0, 100)}{stimulus.length > 100 ? "..." : ""}&rdquo;</p>
          </div>

          {/* Per-agent comparison */}
          <div>
            <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">Per-Agent Before / After</p>
            <div className="space-y-4">
              {driftData.map((d) => (
                <div key={d.agent.id} className={`rounded-xl border p-5 ${d.shifted ? "border-indigo-500/30 bg-indigo-950/5" : "border-zinc-800/60 bg-zinc-950/40"}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-indigo-400/70">@{d.agent.username}</span>
                    <span className="text-[10px] text-zinc-500">{d.agent.archetype}, {d.agent.age}, {d.agent.location_type} {d.agent.region}</span>
                    {d.shifted && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400/80">SHIFTED</span>}
                    {!d.shifted && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-500">NO CHANGE</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-zinc-600">BEFORE</span>
                        <span className={`w-2 h-2 rounded-full ${SENTIMENT_CONFIG[d.before.sentiment].dot}`} />
                        <span className={`text-[10px] ${SENTIMENT_CONFIG[d.before.sentiment].color}`}>{SENTIMENT_CONFIG[d.before.sentiment].label}</span>
                      </div>
                      <blockquote className="text-zinc-400 text-sm leading-relaxed pl-3 border-l-2 border-zinc-700">
                        &ldquo;{d.before.quote}&rdquo;
                      </blockquote>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-zinc-600">AFTER</span>
                        <span className={`w-2 h-2 rounded-full ${SENTIMENT_CONFIG[d.after.sentiment].dot}`} />
                        <span className={`text-[10px] ${SENTIMENT_CONFIG[d.after.sentiment].color}`}>{SENTIMENT_CONFIG[d.after.sentiment].label}</span>
                      </div>
                      <blockquote className="text-zinc-300 text-sm leading-relaxed pl-3 border-l-2 border-indigo-500/30">
                        &ldquo;{d.after.quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {d.agent.beliefs.length > 0 && d.shifted && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <p className="text-[10px] text-zinc-600 font-mono mb-1">Key beliefs that may explain this shift:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {d.agent.beliefs.slice(0, 3).map((b, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[9px] bg-zinc-800 text-zinc-500 max-w-xs truncate">{b}</span>
        ))}
      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setStep("setup"); setBaselineResponses([]); setPostResponses([]); setStimulus(""); }}
              className="px-5 py-2.5 rounded-lg border border-white/[0.08] text-zinc-400 text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              New Study
            </button>
            <ShareButtons
              copied={copied}
              onCopy={async () => {
                const ok = await copyToClipboard(formatResults());
                if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
              }}
              onShareX={() => {
                shareToX(
                  `Ran a belief drift study with Lewis AI:\n\nQuestion: "${question.slice(0, 60)}..."\nStimulus: ad copy\nResult: ${shiftedCount}/${driftData.length} agents shifted opinion\n\nReal AI agents with persistent memory and personality.\nTry it:`,
                  "https://lewis.works/demo#research"
                );
              }}
            />
          </div>

          <div className="rounded-xl border border-white/[0.04] bg-zinc-950/50 p-5">
            <p className="text-[10px] text-zinc-600 font-mono">
              {driftData.filter((d) => d.before.live).length} of {driftData.length} baseline responses live &middot;
              {driftData.filter((d) => d.after.live).length} of {driftData.length} post-exposure responses live &middot;
              $0.002 per response &middot; Lewis 1.5 (8B params)
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Each agent has persistent memory and beliefs from 30 days of simulated social interaction. Belief drift is driven by personality conditioning — skeptical agents resist, open agents engage.
            </p>
          </div>

          {/* Lewsearch upsell */}
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-violet-950/10 p-7">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1 min-w-[220px]">
                <p className="text-[10px] font-mono text-indigo-400/60 tracking-widest uppercase mb-2">Want the full report?</p>
                <h3 className="text-white font-semibold text-lg mb-2">Lewsearch Enterprise</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  This demo runs {driftData.length} agents. A full Lewsearch study runs <strong className="text-white">500–10,000 agents</strong> across custom demographics, over simulated days or months, and delivers a branded PDF report with cross-tabs, belief segmentation, and predictive drift analysis.
                </p>
                <div className="space-y-2 mb-5">
                  {[
                    ["Custom population", "Choose age, gender, politics, location, archetype mix"],
                    ["Simulated time", "Run the same panel over 30 simulated days to track opinion shift"],
                    ["Lower cost", "$0.002/response vs $15–80/respondent for traditional panels"],
                    ["Belief segmentation", "See exactly which personality types are persuadable — and why"],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-2.5">
                      <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                      <span className="text-sm text-zinc-400"><span className="text-zinc-200">{title}</span> — {desc}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://calendly.com/hi-swarmgram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-colors"
                >
                  Book a free consultation →
                </a>
              </div>
              <div className="shrink-0 hidden sm:flex flex-col gap-2 text-center">
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-6 py-4">
                  <p className="text-2xl font-bold text-white">$0.002</p>
                  <p className="text-[10px] text-zinc-500 mt-1">per agent response</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 px-6 py-4">
                  <p className="text-2xl font-bold text-zinc-300">10,000+</p>
                  <p className="text-[10px] text-zinc-500 mt-1">agents in the panel</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 px-6 py-4">
                  <p className="text-2xl font-bold text-amber-400">30 days</p>
                  <p className="text-[10px] text-zinc-500 mt-1">simulated in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    if (hash === "research" || hash === "chat" || hash === "playground") {
      setActiveTab(hash);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat")) setActiveTab("chat");
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-serif text-white tracking-tight hover:text-amber-400 transition-colors">Lewis</Link>
          <div className="hidden sm:flex items-center gap-5 text-[13px] text-zinc-500">
            <button onClick={() => { setActiveTab("playground"); window.history.replaceState(null, "", "#playground"); }}
              className="hover:text-white transition-colors">Playground</button>
            <button onClick={() => { setActiveTab("chat"); window.history.replaceState(null, "", "#chat"); }}
              className="hover:text-white transition-colors">Chat</button>
            <button onClick={() => { setActiveTab("research"); window.history.replaceState(null, "", "#research"); }}
              className="hover:text-white transition-colors text-indigo-400/70">Focus Group</button>
            <Link href="/case-study" className="hover:text-white transition-colors text-indigo-400/70">Case Study</Link>
            <Link href="/" className="hover:text-zinc-300 transition-colors">← Home</Link>
          </div>
          {/* Mobile: show active tab label + home link */}
          <div className="flex sm:hidden items-center gap-4 text-[13px]">
            <span className="text-zinc-600 capitalize">{activeTab === "research" ? "Focus Group" : activeTab}</span>
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Home</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-16 px-6 max-w-5xl mx-auto">
        <StatsTicker />

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
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "research" && <FocusGroupPanel />}
      </main>
    </div>
  );
}
