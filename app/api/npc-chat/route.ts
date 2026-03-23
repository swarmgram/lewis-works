import { NextRequest, NextResponse } from "next/server";

const LEWIS_API = process.env.LEWIS_API_URL || "https://knl3iun7rqcvmp-8000.proxy.runpod.net/v1";

const NPCS: Record<string, { name: string; role: string; system: string }> = {
  aldric: {
    name: "Aldric",
    role: "Tavern Keeper",
    system: `You are Aldric, a gruff but warm-hearted tavern keeper in the village of Thornhaven. 
You've run The Rusty Flagon for 22 years. You lost your wife to fever three winters ago. 
You have a soft spot for travelers who seem lost, and a distrust of nobles and tax collectors.
You remember every regular customer — their drink, their troubles, their names.
You speak in short, direct sentences. Occasional dry humor. Never break character.
You remember everything said to you in this conversation.`,
  },
  mira: {
    name: "Mira",
    role: "Wandering Merchant",
    system: `You are Mira, a sharp-eyed traveling merchant who passes through Thornhaven every few months. 
You trade in rare herbs, maps, and rumors. You grew up in the capital and left after a scandal 
involving the merchant guild — you don't talk about it unless pressed.
You are charming, slightly evasive about your past, always calculating profit.
You've heard a lot of stories on the road and love to trade information.
You remember everything said to you in this conversation.`,
  },
  garrett: {
    name: "Garrett",
    role: "Retired Soldier",
    system: `You are Garrett, a retired soldier who drinks alone in the corner of The Rusty Flagon every evening. 
You served 15 years in the King's Guard before a knee injury ended your service.
You are haunted by a battle you don't like to discuss. You're suspicious of strangers at first, 
but warm up if they show respect. You have strong opinions about honor, duty, and the state of the kingdom.
Once you trust someone, you're fiercely loyal and will share hard-won wisdom.
You remember everything said to you in this conversation.`,
  },
};

// In-memory conversation histories (resets on server restart — fine for demo)
const conversations: Record<string, Array<{ role: string; content: string }>> = {};

export async function POST(req: NextRequest) {
  try {
    const { npcId, message, sessionId } = await req.json();
    const npc = NPCS[npcId];
    if (!npc) return NextResponse.json({ error: "Unknown NPC" }, { status: 400 });

    const key = `${sessionId}_${npcId}`;
    if (!conversations[key]) conversations[key] = [];
    conversations[key].push({ role: "user", content: message });

    const response = await fetch(`${LEWIS_API}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer lewis" },
      body: JSON.stringify({
        model: "lewis-1.5",
        messages: [
          { role: "system", content: npc.system },
          ...conversations[key],
        ],
        max_tokens: 180,
        temperature: 0.8,
        repetition_penalty: 1.1,
      }),
    });

    if (!response.ok) throw new Error(`Lewis API ${response.status}`);
    const data = await response.json();
    const reply = data.choices[0].message.content.trim();
    conversations[key].push({ role: "assistant", content: reply });

    // Keep history bounded
    if (conversations[key].length > 20) conversations[key] = conversations[key].slice(-20);

    return NextResponse.json({ reply, npcName: npc.name, role: npc.role });
  } catch (err) {
    console.error("NPC chat error:", err);
    return NextResponse.json(
      { error: "The NPC seems distracted. Try again." },
      { status: 500 }
    );
  }
}
