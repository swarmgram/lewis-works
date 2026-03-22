import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("agents")
      .select("archetype, mbti_type, age, location_type, region, memory_facts")
      .limit(10000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const agents = data || [];
    const total = agents.length;

    // Archetype distribution
    const archetypeCounts: Record<string, number> = {};
    for (const a of agents) {
      if (a.archetype) archetypeCounts[a.archetype] = (archetypeCounts[a.archetype] || 0) + 1;
    }

    // MBTI groups: Analysts (NT), Diplomats (NF), Sentinels (SJ), Explorers (SP)
    const mbtiGroups: Record<string, number> = { Analysts: 0, Diplomats: 0, Sentinels: 0, Explorers: 0 };
    for (const a of agents) {
      const m = (a.mbti_type || "").toUpperCase();
      if (m.includes("N") && (m.includes("T"))) mbtiGroups.Analysts++;
      else if (m.includes("N") && (m.includes("F"))) mbtiGroups.Diplomats++;
      else if (m.includes("S") && (m.includes("J"))) mbtiGroups.Sentinels++;
      else if (m.includes("S") && (m.includes("P"))) mbtiGroups.Explorers++;
    }

    // Age buckets
    const ageBuckets: Record<string, number> = { "18–24": 0, "25–34": 0, "35–44": 0, "45–54": 0, "55–64": 0, "65+": 0 };
    for (const a of agents) {
      const age = parseInt(a.age || "0", 10);
      if (age >= 18 && age <= 24) ageBuckets["18–24"]++;
      else if (age >= 25 && age <= 34) ageBuckets["25–34"]++;
      else if (age >= 35 && age <= 44) ageBuckets["35–44"]++;
      else if (age >= 45 && age <= 54) ageBuckets["45–54"]++;
      else if (age >= 55 && age <= 64) ageBuckets["55–64"]++;
      else if (age >= 65) ageBuckets["65+"]++;
    }

    // Gender from memory_facts._identity
    const genderCounts: Record<string, number> = { Male: 0, Female: 0, "Non-binary": 0, Other: 0 };
    for (const a of agents) {
      const gender = a.memory_facts?._identity?.gender || a.memory_facts?._identity?.sex || "";
      const g = String(gender).toLowerCase();
      if (g === "male" || g === "m") genderCounts.Male++;
      else if (g === "female" || g === "f") genderCounts.Female++;
      else if (g.includes("non") || g.includes("enby")) genderCounts["Non-binary"]++;
      else if (g) genderCounts.Other++;
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

    // Top archetypes sorted
    const topArchetypes = Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

    const genderWithPct = Object.entries(genderCounts)
      .filter(([, v]) => v > 0)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

    const ageWithPct = Object.entries(ageBuckets)
      .map(([range, count]) => ({ range, count, pct: Math.round((count / total) * 100) }));

    const mbtiWithPct = Object.entries(mbtiGroups)
      .map(([group, count]) => ({ group, count, pct: Math.round((count / total) * 100) }));

    const locationWithPct = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }));

    return NextResponse.json({
      total,
      archetypes: topArchetypes,
      gender: genderWithPct,
      age: ageWithPct,
      mbti: mbtiWithPct,
      location: locationWithPct,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
