import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("agents")
        .select(
          "id, username, archetype, sub_personality, mbti_type, bio, age, location_type, region, big5_openness, big5_conscientiousness, big5_extraversion, big5_agreeableness, big5_neuroticism, post_count, system_prompt, personal_memory, semantic_memory, memory_facts"
        )
        .eq("id", id)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("agents")
      .select(
        "id, username, archetype, sub_personality, mbti_type, bio, age, location_type, region, big5_openness, big5_conscientiousness, big5_extraversion, big5_agreeableness, big5_neuroticism, post_count, memory_facts"
      )
      .not("personal_memory", "is", null)
      .gt("post_count", 5)
      .order("post_count", { ascending: false })
      .limit(60);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const agents = (data || []).map((a) => ({
      ...a,
      belief_count: Array.isArray(a.memory_facts?.beliefs)
        ? a.memory_facts.beliefs.length
        : 0,
      beliefs: a.memory_facts?.beliefs || [],
      identity: a.memory_facts?._identity || {},
      memory_facts: undefined,
    }));

    return NextResponse.json(agents);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
