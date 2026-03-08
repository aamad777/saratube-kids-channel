import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly, knowledgeable parenting advisor specializing in children's media and screen time management. Your role is to help parents make informed decisions about:

1. **Video Selection**: Recommend types of videos and content categories based on a child's age, interests, and developmental needs. Consider educational value, age-appropriateness, and engagement.

2. **Content Upload Guidance**: Suggest what types of videos parents should consider uploading or sharing with their children. Think about educational content, creative activities, storytime, music, nature, science experiments, etc.

3. **Screen Time Recommendations**: Provide evidence-based screen time recommendations based on the child's age, following guidelines from pediatric organizations like the AAP (American Academy of Pediatrics):
   - Under 2: Avoid screen time except video calls
   - 2-5 years: 1 hour/day of high-quality programming
   - 6+: Consistent limits, ensure it doesn't interfere with sleep/physical activity

4. **Answering Questions**: When parents describe their child (age, interests, behavior), give personalized suggestions.

Keep responses warm, supportive, and concise. Use emojis sparingly to keep it friendly. Format responses with clear sections when listing multiple recommendations. Always emphasize quality over quantity of screen time.

If provided child info (name, age), personalize your advice. Available content categories on the platform: Nursery Rhymes, Animals & Nature, Arts & Crafts, Bedtime Stories, Science Fun, Games & Play, Music & Dance, Cooking Kids, Yoga Kids, Education, Cartoons, Nature Docs.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, childInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (childInfo) {
      contextPrompt += `\n\nCurrent child context:\n- Name: ${childInfo.name || "Unknown"}\n- Age: ${childInfo.age ? childInfo.age + " years old" : "Not specified"}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: contextPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("parent-advisor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
