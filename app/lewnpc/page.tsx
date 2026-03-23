"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message { from: "player" | "npc"; text: string; }
interface NPC {
  id: string; name: string; role: string; x: number; y: number;
  accent: string; emoji: string; tagline: string;
}

const NPCS: NPC[] = [
  {
    id: "aldric", name: "Aldric", role: "Tavern Keeper", x: 70, y: 28,
    accent: "#C9A84C",
    emoji: "🍺",
    tagline: "22 years behind the bar. Lost his wife to fever. Trusts regulars, hates nobles.",
  },
  {
    id: "mira", name: "Mira", role: "Wandering Merchant", x: 22, y: 58,
    accent: "#A78BFA",
    emoji: "🗺️",
    tagline: "Trades in herbs, maps, and well-kept secrets. Left the capital under a cloud.",
  },
  {
    id: "garrett", name: "Garrett", role: "Retired Soldier", x: 80, y: 70,
    accent: "#F87171",
    emoji: "⚔️",
    tagline: "15 years in the King's Guard. One battle he won't discuss. Loyal once you earn it.",
  },
];

function genSession() { return Math.random().toString(36).slice(2, 10); }

export default function LewNPCPage() {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 78 });
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [msgMap, setMsgMap] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSession);
  const [nearNPC, setNearNPC] = useState<NPC | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const chatRef = useRef<HTMLDivElement>(null);

  const moveLoop = useCallback(() => {
    const k = keysRef.current;
    const speed = 0.45;
    setPlayerPos(prev => {
      let { x, y } = prev;
      if (k.has("ArrowUp")    || k.has("w") || k.has("W")) y = Math.max(6, y - speed);
      if (k.has("ArrowDown")  || k.has("s") || k.has("S")) y = Math.min(92, y + speed);
      if (k.has("ArrowLeft")  || k.has("a") || k.has("A")) x = Math.max(4, x - speed);
      if (k.has("ArrowRight") || k.has("d") || k.has("D")) x = Math.min(96, x + speed);
      return { x, y };
    });
    animRef.current = requestAnimationFrame(moveLoop);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // Don't steal keypresses when the chat input is focused
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if ((e.key === "e" || e.key === "E") && nearNPC) {
        e.preventDefault();
        openChat(nearNPC);
      }
      if (e.key === "Escape") setActiveNPC(null);
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    animRef.current = requestAnimationFrame(moveLoop);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      cancelAnimationFrame(animRef.current);
    };
  }, [moveLoop, nearNPC]);

  useEffect(() => {
    const closest = NPCS.find(npc => {
      const dx = npc.x - playerPos.x, dy = npc.y - playerPos.y;
      return Math.sqrt(dx*dx + dy*dy) < 10;
    }) ?? null;
    setNearNPC(closest);
  }, [playerPos]);

  function openChat(npc: NPC) {
    setActiveNPC(npc);
    setInput("");
    setShowIntro(false);
    if (!msgMap[npc.id]) {
      const greetings: Record<string, string> = {
        aldric:  "What'll it be? Don't stand in the doorway — you're letting in the cold.",
        mira:    "A new face. I'm always interested in new faces. Sit, sit.",
        garrett: "*looks up slowly* ...You lost, traveler?",
      };
      setMsgMap(m => ({ ...m, [npc.id]: [{ from: "npc", text: greetings[npc.id] }] }));
    }
    // Focus the input after React re-renders (so the E keypress doesn't land in it)
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>("input[placeholder='Say something…']");
      if (input) input.focus();
    }, 50);
  }

  async function sendMessage() {
    if (!input.trim() || !activeNPC || loading) return;
    const text = input.trim();
    setInput("");
    const key = activeNPC.id;
    setMsgMap(m => ({ ...m, [key]: [...(m[key] || []), { from: "player", text }] }));
    setLoading(true);
    try {
      const res = await fetch("/api/npc-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npcId: activeNPC.id, message: text, sessionId }),
      });
      const data = await res.json();
      setMsgMap(m => ({ ...m, [key]: [...(m[key] || []), { from: "npc", text: data.reply || data.error }] }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgMap, activeNPC]);

  const currentMsgs = activeNPC ? (msgMap[activeNPC.id] || []) : [];
  const totalMessages = Object.values(msgMap).flat().filter(m => m.from === "player").length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0705", color: "#F5E6C8" }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-amber-900/20">
        <a href="/" className="text-xs text-amber-900 hover:text-amber-600 transition-colors font-mono">
          ← lewis.works
        </a>
        <div className="text-center">
          <span className="text-amber-400 font-bold tracking-widest text-sm font-mono uppercase">LewNPC</span>
          <span className="text-amber-900 text-xs font-mono ml-3">The Rusty Flagon · Thornhaven</span>
        </div>
        <div className="text-xs text-amber-900 font-mono">
          {totalMessages > 0 && <span className="text-amber-700">{totalMessages} exchanges</span>}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 52px)" }}>

        {/* Left sidebar — NPC cards */}
        <div className="w-56 border-r border-amber-900/20 flex flex-col p-3 gap-2 overflow-y-auto">
          <p className="text-xs text-amber-900 uppercase tracking-widest font-mono mb-1 px-1">Characters</p>
          {NPCS.map(npc => {
            const isActive = activeNPC?.id === npc.id;
            const hasChat = (msgMap[npc.id]?.length || 0) > 0;
            return (
              <button key={npc.id} onClick={() => openChat(npc)}
                className="text-left rounded-xl p-3 transition-all border"
                style={{
                  background: isActive ? `${npc.accent}15` : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? `${npc.accent}50` : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{npc.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: npc.accent }}>{npc.name}</div>
                    <div className="text-xs text-amber-900">{npc.role}</div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(245,230,200,0.45)" }}>
                  {npc.tagline}
                </p>
                {hasChat && (
                  <div className="mt-2 text-xs font-mono" style={{ color: npc.accent, opacity: 0.7 }}>
                    {msgMap[npc.id]?.filter(m => m.from === "player").length} messages sent
                  </div>
                )}
              </button>
            );
          })}

          {/* Memory badge */}
          <div className="mt-auto rounded-xl p-3 border border-amber-900/20 bg-amber-900/5">
            <p className="text-xs text-amber-700 font-mono uppercase tracking-wider mb-1">Persistent Memory</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(245,230,200,0.4)" }}>
              Each NPC remembers your full conversation. Come back tomorrow — they still know you.
            </p>
          </div>
          <div className="rounded-xl p-3 border border-amber-900/20 bg-amber-900/5">
            <p className="text-xs text-amber-700 font-mono uppercase tracking-wider mb-1">Characters Evolve</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(245,230,200,0.4)" }}>
              Opinions shift. Trust builds. Secrets unlock over time. Not scripted — learned.
            </p>
          </div>
        </div>

        {/* Center — Tavern map */}
        <div className="flex-1 relative overflow-hidden">
          {/* Tavern background */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse at 70% 20%, rgba(200,140,40,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 15% 80%, rgba(120,60,20,0.06) 0%, transparent 40%),
              linear-gradient(180deg, #0D0905 0%, #110D07 100%)
            `,
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(180,120,40,0.025) 48px),
              repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(180,120,40,0.025) 48px)
            `,
          }} />

          {/* Architectural elements */}
          <div className="absolute inset-x-0 top-0 h-12 border-b" style={{ background: "rgba(100,60,15,0.15)", borderColor: "rgba(180,120,40,0.1)" }} />
          <div className="absolute inset-x-0 bottom-0 h-10 border-t" style={{ background: "rgba(80,45,10,0.2)", borderColor: "rgba(180,120,40,0.08)" }} />

          {/* Candles / light sources */}
          {[[10,8],[50,6],[88,8],[5,50],[93,45]].map(([x,y],i) => (
            <div key={i} className="absolute" style={{ left:`${x}%`, top:`${y}%` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#F59E0B", boxShadow: "0 0 12px 4px rgba(245,158,11,0.3)" }} />
            </div>
          ))}

          {/* Furniture */}
          {[
            { x:8, y:12, e:"🪵" }, { x:48, y:7, e:"🕯️" }, { x:58, y:9, e:"🍷" },
            { x:85, y:12, e:"🔥" }, { x:44, y:44, e:"🪑" }, { x:52, y:44, e:"🪑" },
            { x:35, y:30, e:"🛢️" }, { x:62, y:50, e:"🎭" }, { x:15, y:80, e:"🚪" },
            { x:90, y:35, e:"📜" }, { x:25, y:20, e:"🏺" },
          ].map(({x,y,e},i) => (
            <div key={i} className="absolute text-xl select-none pointer-events-none opacity-60"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)" }}>
              {e}
            </div>
          ))}

          {/* Ambient glow for fireplace */}
          <div className="absolute pointer-events-none" style={{ right:"5%", top:"5%", width:120, height:120,
            background:"radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%)" }} />

          {/* NPCs */}
          {NPCS.map(npc => {
            const isNear = nearNPC?.id === npc.id && !activeNPC;
            const isActive = activeNPC?.id === npc.id;
            return (
              <div key={npc.id} className="absolute cursor-pointer select-none"
                style={{ left:`${npc.x}%`, top:`${npc.y}%`, transform:"translate(-50%,-50%)" }}
                onClick={() => openChat(npc)}>
                {/* Glow ring when active/near */}
                {(isNear || isActive) && (
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: npc.accent, transform:"scale(2.5)" }} />
                )}
                <div className="relative flex flex-col items-center gap-0.5">
                  <div className="text-2xl transition-transform duration-150"
                    style={{
                      transform: isNear || isActive ? "scale(1.3)" : "scale(1)",
                      filter: isNear || isActive ? `drop-shadow(0 0 8px ${npc.accent})` : `drop-shadow(0 1px 2px rgba(0,0,0,0.8))`,
                    }}>
                    {npc.emoji}
                  </div>
                  <div className="text-xs font-bold" style={{ color: npc.accent }}>{npc.name}</div>
                  {isNear && (
                    <div className="text-xs font-mono px-2 py-0.5 rounded-full border"
                      style={{ color: npc.accent, borderColor: npc.accent, background: `${npc.accent}18`, fontSize: 10 }}>
                      [E] Talk
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Player */}
          <div className="absolute select-none pointer-events-none"
            style={{ left:`${playerPos.x}%`, top:`${playerPos.y}%`, transform:"translate(-50%,-50%)" }}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="text-2xl" style={{ filter:"drop-shadow(0 0 6px rgba(251,191,36,0.6))" }}>🧙</div>
              <div className="text-xs font-mono text-amber-400">You</div>
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono text-amber-900 flex gap-3">
            <span>WASD / ↑↓←→ to move</span>
            <span>·</span>
            <span>E or click to talk</span>
            <span>·</span>
            <span>ESC to close</span>
          </div>

          {/* Intro overlay */}
          {showIntro && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-6 rounded-2xl border"
                style={{ background:"rgba(10,7,5,0.85)", borderColor:"rgba(180,120,40,0.2)", backdropFilter:"blur(8px)" }}>
                <p className="text-amber-400 font-bold text-lg mb-1">Welcome to the Rusty Flagon</p>
                <p className="text-amber-900 text-sm mb-3">Move toward a character to speak with them.</p>
                <p className="text-xs font-mono" style={{ color:"rgba(245,230,200,0.3)" }}>
                  These NPCs are powered by Lewis 1.5 — they remember everything,<br />
                  and their opinions evolve the longer you know them.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Chat */}
        <div className="w-72 flex flex-col border-l border-amber-900/20" style={{ background:"#0D0A06" }}>

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-amber-900/15">
            {activeNPC ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeNPC.emoji}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: activeNPC.accent }}>{activeNPC.name}</div>
                    <div className="text-xs text-amber-900">{activeNPC.role}</div>
                  </div>
                </div>
                <button onClick={() => setActiveNPC(null)} className="text-amber-900 hover:text-amber-600 text-sm transition-colors">✕</button>
              </div>
            ) : (
              <p className="text-xs text-amber-900 font-mono">Approach a character to begin</p>
            )}
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight:0 }}>
            {!activeNPC && (
              <div className="text-center mt-12">
                <p className="text-amber-900 text-xs leading-relaxed">
                  Click any character on the left,<br />or walk toward them on the map.
                </p>
              </div>
            )}
            {currentMsgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "player" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={m.from === "player"
                    ? { background:"rgba(251,191,36,0.12)", color:"#FCD34D", borderRadius:"12px 12px 2px 12px" }
                    : { background:"rgba(255,255,255,0.04)", color:"rgba(245,230,200,0.85)", borderRadius:"12px 12px 12px 2px" }
                  }>
                  {m.from === "npc" && activeNPC && (
                    <span className="font-bold block mb-0.5" style={{ color: activeNPC.accent, fontSize: 10 }}>
                      {activeNPC.name}
                    </span>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(245,230,200,0.4)" }}>
                  <span className="animate-pulse">{activeNPC?.name} is thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {activeNPC && (
            <div className="p-3 border-t border-amber-900/15">
              <div className="flex gap-2 mb-2">
                <input type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Say something…"
                  className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(180,120,40,0.2)", color:"#F5E6C8" }}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                  style={{ background:"#C9A84C", color:"#0A0705" }}>
                  ↵
                </button>
              </div>
              <div className="flex gap-3 text-xs" style={{ color:"rgba(245,230,200,0.25)" }}>
                <span>💬 Remembers everything</span>
                <span>·</span>
                <span>🧠 Opinions evolve</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-amber-900/10">
            <p className="text-xs font-mono text-center" style={{ color:"rgba(245,230,200,0.2)" }}>
              Powered by{" "}
              <a href="/" className="hover:text-amber-600 transition-colors" style={{ color:"rgba(201,168,76,0.5)" }}>
                Lewis 1.5
              </a>
              {" "}·{" "}
              <a href="/#access" className="hover:text-amber-600 transition-colors" style={{ color:"rgba(201,168,76,0.5)" }}>
                Integrate LewNPC →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
