"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Message { from: "player" | "npc"; text: string; }
interface NPC {
  id: string; name: string; role: string; x: number; y: number;
  color: string; emoji: string; description: string;
}

// ── NPCs ─────────────────────────────────────────────────────────────────────
const NPCS: NPC[] = [
  { id: "aldric",  name: "Aldric",  role: "Tavern Keeper",     x: 72, y: 30, color: "#C9A84C", emoji: "🍺", description: "Knows every face that's passed through Thornhaven." },
  { id: "mira",    name: "Mira",    role: "Wandering Merchant", x: 25, y: 55, color: "#8B5CF6", emoji: "🗺️", description: "Trades in herbs, maps, and well-kept secrets." },
  { id: "garrett", name: "Garrett", role: "Retired Soldier",   x: 80, y: 68, color: "#EF4444", emoji: "⚔️", description: "Drinks alone. Watched too many wars end badly." },
];

// ── Session ID ────────────────────────────────────────────────────────────────
function genSession() { return Math.random().toString(36).slice(2, 10); }

// ── Main Component ────────────────────────────────────────────────────────────
export default function NPCTavern() {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 75 });
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSession);
  const [nearNPC, setNearNPC] = useState<NPC | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const chatRef = useRef<HTMLDivElement>(null);

  // ── Movement ──────────────────────────────────────────────────────────────
  const moveLoop = useCallback(() => {
    const k = keysRef.current;
    const speed = 0.5;
    setPlayerPos(prev => {
      let { x, y } = prev;
      if (k.has("ArrowUp")    || k.has("w") || k.has("W")) y = Math.max(5,  y - speed);
      if (k.has("ArrowDown")  || k.has("s") || k.has("S")) y = Math.min(90, y + speed);
      if (k.has("ArrowLeft")  || k.has("a") || k.has("A")) x = Math.max(5,  x - speed);
      if (k.has("ArrowRight") || k.has("d") || k.has("D")) x = Math.min(95, x + speed);
      return { x, y };
    });
    animRef.current = requestAnimationFrame(moveLoop);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        if (nearNPC && !activeNPC) openChat(nearNPC);
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
  }, [moveLoop, nearNPC, activeNPC]);

  // ── Proximity detection ───────────────────────────────────────────────────
  useEffect(() => {
    const closest = NPCS.find(npc => {
      const dx = npc.x - playerPos.x;
      const dy = npc.y - playerPos.y;
      return Math.sqrt(dx * dx + dy * dy) < 10;
    }) ?? null;
    setNearNPC(closest);
  }, [playerPos]);

  // ── Chat ──────────────────────────────────────────────────────────────────
  function openChat(npc: NPC) {
    setActiveNPC(npc);
    if (messages.length === 0) {
      setMessages([{ from: "npc", text: getGreeting(npc.id) }]);
    }
  }

  function getGreeting(id: string) {
    if (id === "aldric")  return "What'll it be, traveler? Don't stand in the doorway.";
    if (id === "mira")    return "Oh, a new face. I'm always interested in new faces.";
    if (id === "garrett") return "*looks up slowly* You lost?";
    return "...";
  }

  async function sendMessage() {
    if (!input.trim() || !activeNPC || loading) return;
    const text = input.trim();
    setInput("");
    setMessages(m => [...m, { from: "player", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/npc-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npcId: activeNPC.id, message: text, sessionId }),
      });
      const data = await res.json();
      setMessages(m => [...m, { from: "npc", text: data.reply || data.error }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0705] text-amber-100 font-mono flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-amber-400 text-lg font-bold tracking-wider">⚔ THE RUSTY FLAGON</h1>
          <p className="text-amber-900 text-xs">LewNPC Demo — persistent-memory AI characters</p>
        </div>
        <a href="/" className="text-xs text-amber-800 hover:text-amber-500 transition-colors border border-amber-900/40 px-3 py-1 rounded">
          ← lewis.works
        </a>
      </div>

      <div className="w-full max-w-4xl flex gap-4">
        {/* Tavern Map */}
        <div className="flex-1 relative" style={{ aspectRatio: "16/10" }}>
          {/* Floor */}
          <div className="absolute inset-0 rounded-xl overflow-hidden border border-amber-900/30"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, #1a1008 0%, #0d0905 100%)",
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(180,120,40,0.04) 40px),
                                repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(180,120,40,0.04) 40px)`,
            }}>

            {/* Tavern furniture (decorative) */}
            <div className="absolute text-2xl" style={{ left: "8%", top: "10%" }}>🪵</div>
            <div className="absolute text-lg" style={{ left: "40%", top: "8%" }}>🕯️</div>
            <div className="absolute text-xl" style={{ left: "55%", top: "10%" }}>🍷</div>
            <div className="absolute text-2xl" style={{ left: "85%", top: "10%" }}>🔥</div>
            <div className="absolute text-2xl" style={{ left: "45%", top: "40%" }}>🪑</div>
            <div className="absolute text-lg" style={{ left: "15%", top: "80%" }}>🚪</div>

            {/* NPCs */}
            {NPCS.map(npc => {
              const isNear = nearNPC?.id === npc.id;
              const isActive = activeNPC?.id === npc.id;
              return (
                <div
                  key={npc.id}
                  className="absolute cursor-pointer transition-transform"
                  style={{ left: `${npc.x}%`, top: `${npc.y}%`, transform: "translate(-50%,-50%)" }}
                  onClick={() => openChat(npc)}
                >
                  {(isNear || isActive) && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                      style={{ color: npc.color }}>
                      [E] Talk
                    </div>
                  )}
                  <div className={`text-2xl transition-all ${isNear || isActive ? "scale-125" : ""}`}
                    style={{ filter: isNear || isActive ? `drop-shadow(0 0 6px ${npc.color})` : "none" }}>
                    {npc.emoji}
                  </div>
                  <div className="text-center text-xs mt-0.5" style={{ color: npc.color }}>{npc.name}</div>
                </div>
              );
            })}

            {/* Player */}
            <div
              className="absolute text-xl transition-none"
              style={{
                left: `${playerPos.x}%`,
                top: `${playerPos.y}%`,
                transform: "translate(-50%,-50%)",
                filter: "drop-shadow(0 0 4px #fbbf24)",
              }}
            >
              🧙
              <div className="text-center text-xs text-amber-400">You</div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-72 flex flex-col bg-[#110D07] border border-amber-900/30 rounded-xl overflow-hidden">
          {/* NPC header */}
          <div className="px-4 py-3 border-b border-amber-900/20 bg-[#0D0A05]">
            {activeNPC ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-300 font-bold text-sm">{activeNPC.emoji} {activeNPC.name}</div>
                  <div className="text-amber-800 text-xs">{activeNPC.role}</div>
                </div>
                <button onClick={() => setActiveNPC(null)} className="text-amber-900 hover:text-amber-500 text-xs">✕</button>
              </div>
            ) : (
              <div>
                <div className="text-amber-700 text-xs mb-2">NPCs in the tavern:</div>
                {NPCS.map(npc => (
                  <button key={npc.id} onClick={() => openChat(npc)}
                    className="block w-full text-left px-2 py-1.5 rounded hover:bg-amber-900/20 transition-colors mb-1">
                    <span style={{ color: npc.color }}>{npc.emoji} {npc.name}</span>
                    <span className="text-amber-900 text-xs ml-2">{npc.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[280px] max-h-[320px]">
            {!activeNPC && (
              <p className="text-amber-900 text-xs text-center mt-8">
                Move with WASD / arrow keys.<br />
                Approach an NPC and press E to talk,<br />
                or click their name above.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-xs leading-relaxed ${m.from === "player" ? "text-right" : ""}`}>
                {m.from === "npc" && activeNPC && (
                  <span style={{ color: activeNPC.color }} className="font-bold">{activeNPC.name}: </span>
                )}
                {m.from === "player" && <span className="text-amber-500 font-bold">You: </span>}
                <span className={m.from === "npc" ? "text-amber-200" : "text-amber-400"}>{m.text}</span>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-amber-800 italic">
                {activeNPC?.name} is thinking<span className="animate-pulse">...</span>
              </div>
            )}
          </div>

          {/* Input */}
          {activeNPC && (
            <div className="p-3 border-t border-amber-900/20">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Say something..."
                  className="flex-1 bg-[#0A0705] border border-amber-900/30 rounded px-2 py-1.5 text-xs text-amber-200 placeholder-amber-900 focus:outline-none focus:border-amber-700"
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-black text-xs font-bold rounded transition-colors">
                  ↵
                </button>
              </div>
              <p className="text-amber-900 text-xs mt-1.5 text-center">
                This NPC <span className="text-amber-700">remembers</span> everything you say
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-amber-900 text-xs max-w-lg">
        <p>
          These NPCs are powered by <span className="text-amber-700">Lewis 1.5</span> — 
          persistent-memory AI characters with distinct personalities. Each remembers 
          the full context of your conversation.{" "}
          <a href="/#access" className="text-amber-600 hover:text-amber-400">
            Integrate LewNPC into your game →
          </a>
        </p>
      </div>
    </div>
  );
}
