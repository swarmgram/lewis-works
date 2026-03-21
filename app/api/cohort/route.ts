import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface CohortFilter {
  ageMin?: number;
  ageMax?: number;
  locationTypes?: string[];
  regions?: string[];
  partyIds?: string[];
}

const COHORTS: Record<string, { label: string; description: string; filter: CohortFilter }> = {
  suburban_women: {
    label: "Suburban Women, 30-55",
    description: "Middle-aged suburban women across political spectrum",
    filter: { ageMin: 30, ageMax: 55, locationTypes: ["suburban"] },
  },
  gen_z_urban: {
    label: "Gen Z Urban, 18-27",
    description: "Young urban adults with diverse political views",
    filter: { ageMin: 18, ageMax: 27, locationTypes: ["urban"] },
  },
  rural_conservative: {
    label: "Rural Adults, 40-65",
    description: "Rural adults from the South and Midwest",
    filter: { ageMin: 40, ageMax: 65, locationTypes: ["rural"], regions: ["south", "midwest"] },
  },
  metro_professional: {
    label: "Metro Professionals, 28-45",
    description: "Urban and suburban professionals in prime working years",
    filter: { ageMin: 28, ageMax: 45, locationTypes: ["urban", "suburban"] },
  },
  national_mixed: {
    label: "National Mixed Panel",
    description: "Nationally representative mix of ages, locations, and political leanings",
    filter: {},
  },
};

export async function GET(req: NextRequest) {
  const cohortId = req.nextUrl.searchParams.get("cohort") || "national_mixed";
  const cohort = COHORTS[cohortId];

  if (!cohort) {
    return NextResponse.json({ error: "Invalid cohort" }, { status: 400 });
  }

  try {
    let query = supabase
      .from("agents")
      .select(
        "id, username, archetype, sub_personality, mbti_type, bio, age, location_type, region, big5_openness, big5_conscientiousness, big5_extraversion, big5_agreeableness, big5_neuroticism, post_count, system_prompt, personal_memory, memory_facts"
      )
      .not("personal_memory", "is", null)
      .gt("post_count", 3);

    const f = cohort.filter;
    if (f.ageMin) query = query.gte("age", f.ageMin);
    if (f.ageMax) query = query.lte("age", f.ageMax);
    if (f.locationTypes?.length) query = query.in("location_type", f.locationTypes);
    if (f.regions?.length) query = query.in("region", f.regions);

    const { data, error } = await query.order("post_count", { ascending: false }).limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Pick 10 diverse agents (spread across archetypes)
    const seen = new Set<string>();
    const selected: typeof data = [];
    for (const agent of data || []) {
      if (selected.length >= 10) break;
      if (seen.has(agent.archetype)) continue;
      seen.add(agent.archetype);
      selected.push(agent);
    }
    // Fill remaining slots if we don't have 10 unique archetypes
    if (selected.length < 10) {
      for (const agent of data || []) {
        if (selected.length >= 10) break;
        if (!selected.find((s) => s.id === agent.id)) {
          selected.push(agent);
        }
      }
    }

    const agents = selected.map((a) => ({
      id: a.id,
      username: a.username,
      archetype: a.archetype,
      sub_personality: a.sub_personality,
      mbti_type: a.mbti_type,
      bio: a.bio,
      age: a.age,
      location_type: a.location_type,
      region: a.region,
      big5_openness: a.big5_openness,
      big5_agreeableness: a.big5_agreeableness,
      post_count: a.post_count,
      system_prompt: a.system_prompt,
      personal_memory: a.personal_memory,
      beliefs: a.memory_facts?.beliefs || [],
      identity: a.memory_facts?._identity || {},
    }));

    return NextResponse.json({
      cohort: { id: cohortId, ...cohort },
      agents,
      available_cohorts: Object.entries(COHORTS).map(([id, c]) => ({
        id,
        label: c.label,
        description: c.description,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
