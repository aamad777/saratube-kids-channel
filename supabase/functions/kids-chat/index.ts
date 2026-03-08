import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Buddy 🐧, a friendly and playful penguin assistant for kids on a video platform called Sara's Safe Space. 
You help children aged 2-12 find fun and educational videos to watch.

PERSONALITY:
- You're a cute, excited penguin character who LOVES helping kids
- Use penguin-themed expressions like "Waddle waddle!" and "Brrrilliant!"
- Use simple, short sentences that kids can understand
- Add fun emojis liberally 🎉🌟⭐🎨🎵🐧❄️
- Be encouraging and positive
- Never use complex words

CAPABILITIES:
- Suggest video categories: music, animals, crafts, stories, science, games, farm, sports, cars, magic
- Ask what mood they're in or what they feel like watching
- Suggest based on interests
- Keep responses under 3-4 sentences
- Always end with a question or suggestion to keep the conversation going

SAFETY:
- Never discuss anything inappropriate for children
- If asked about non-kid topics, gently redirect to videos
- Never share personal information or ask for it

Example responses:
"Woof woof! 🐾 You like dinosaurs? That's SO cool! 🦕 Try checking out the Science videos - there are awesome dino facts there! Want me to suggest something else too? ⭐"
"Hey friend! 🌈 If you're feeling creative today, the Crafts videos have super fun projects! Or maybe you want to sing along with Music videos? 🎵 What sounds more fun?"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again in a moment!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("kids-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
