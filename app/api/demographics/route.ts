import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PARTY_LABELS: Record<string, string> = {
  strong_dem: "Strong Dem",
  lean_dem: "Lean Dem",
  ind_dem: "Ind → Dem",
  independent: "Independent",
  ind_rep: "Ind → Rep",
  lean_rep: "Lean Rep",
  strong_rep: "Strong Rep",
  other_party: "Other / Third",
  nonvoter: "Non-voter",
};

const TRUST_LABELS: Record<string, string> = {
  high: "High trust",
  medium: "Medium trust",
  low: "Low trust",
  very_low: "Very low trust",
};

export async function GET() {
  try {
    // Fetch in batches to get past the 1000-row default limit
    let allAgents: {
      archetype: string | null;
      mbti_type: string | null;
      age: number | null;
      location_type: string | null;
      region: string | null;
      memory_facts: Record<string, unknown> | null;
    }[] = [];

    for (let offset = 0; offset < 12000; offset += 1000) {
      const { data, error } = await supabase
        .from("agents")
        .select("archetype, mbti_type, age, location_type, region, memory_facts")
        .range(offset, offset + 999);
      if (error || !data || data.length === 0) break;
      allAgents = allAgents.concat(data);
      if (data.length < 1000) break;
    }

    const agents = allAgents;
    const total = agents.length;
    if (total === 0) return NextResponse.json({ total: 0, archetypes: [], age: [], mbti: [], party: [], trust: [], location: [], region: [] });

    // Archetype distribution
    const archetypeCounts: Record<string, number> = {};
    for (const a of agents) {
      if (a.archetype) archetypeCounts[a.archetype] = (archetypeCounts[a.archetype] || 0) + 1;
    }

    // MBTI groups
    const mbtiGroups: Record<string, number> = { Analysts: 0, Diplomats: 0, Sentinels: 0, Explorers: 0 };
    for (const a of agents) {
      const m = (a.mbti_type || "").toUpperCase();
      if (m.includes("N") && m.includes("T")) mbtiGroups.Analysts++;
      else if (m.includes("N") && m.includes("F")) mbtiGroups.Diplomats++;
      else if (m.includes("S") && m.includes("J")) mbtiGroups.Sentinels++;
      else if (m.includes("S") && m.includes("P")) mbtiGroups.Explorers++;
    }

    // Age buckets (age is stored as integer)
    const ageBuckets: Record<string, number> = { "18–24": 0, "25–34": 0, "35–44": 0, "45–54": 0, "55–64": 0, "65+": 0 };
    for (const a of agents) {
      const age = typeof a.age === "number" ? a.age : parseInt(String(a.age || "0"), 10);
      if (age >= 18 && age <= 24) ageBuckets["18–24"]++;
      else if (age >= 25 && age <= 34) ageBuckets["25–34"]++;
      else if (age >= 35 && age <= 44) ageBuckets["35–44"]++;
      else if (age >= 45 && age <= 54) ageBuckets["45–54"]++;
      else if (age >= 55 && age <= 64) ageBuckets["55–64"]++;
      else if (age >= 65) ageBuckets["65+"]++;
    }

    // Party affiliation from memory_facts._identity.party_id
    const partyCounts: Record<string, number> = {};
    for (const a of agents) {
      const mf = a.memory_facts as Record<string, unknown> | null;
      const identity = (mf?._identity || {}) as Record<string, unknown>;
      const party = String(identity.party_id || "").trim();
      if (party) partyCounts[party] = (partyCounts[party] || 0) + 1;
    }

    // Institutional trust from memory_facts._identity.institutional_trust
    const trustCounts: Record<string, number> = {};
    for (const a of agents) {
      const mf = a.memory_facts as Record<string, unknown> | null;
      const identity = (mf?._identity || {}) as Record<string, unknown>;
      const trust = String(identity.institutional_trust || "").trim();
      if (trust) trustCounts[trust] = (trustCounts[trust] || 0) + 1;
    }

    // Location type
    const locationCounts: Record<string, number> = {};
    for (const a of agents) {
      if (a.location_type) locationCounts[a.location_type] = (locationCounts[a.location_type] || 0) + 1;
    }

    // Region
    const regionCounts: Record<string, number> = {};
    for (const a of agents) {
      if (a.region) regionCounts[a.region] = (regionCounts[a.region] || 0) + 1;
    }

    const topArchetypes = Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

    const ageWithPct = Object.entries(ageBuckets)
      .map(([range, count]) => ({ range, count, pct: Math.round((count / total) * 100) }))
      .filter((a) => a.count > 0);

    const mbtiWithPct = Object.entries(mbtiGroups)
      .map(([group, count]) => ({ group, count, pct: Math.round((count / total) * 100) }));

    const partyWithPct = Object.entries(partyCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: PARTY_LABELS[id] || id, count, pct: Math.round((count / total) * 100) }));

    const trustWithPct = Object.entries(trustCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: TRUST_LABELS[id] || id, count, pct: Math.round((count / total) * 100) }));

    const locationWithPct = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }));

    const regionWithPct = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

    return NextResponse.json({
      total,
      archetypes: topArchetypes,
      age: ageWithPct,
      mbti: mbtiWithPct,
      party: partyWithPct,
      trust: trustWithPct,
      location: locationWithPct,
      region: regionWithPct,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
