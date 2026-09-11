import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory sliding window rate limiter: max 30 requests per 15-minute window per UID
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const userRate = rateLimitMap.get(uid);

  if (!userRate || now > userRate.resetTime) {
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (userRate.count >= RATE_LIMIT_MAX) {
    return true;
  }

  userRate.count += 1;
  return false;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing GEMINI_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract authorization bearer header for identity
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const clientUid = req.headers.get("x-user-uid") || (token ? "auth_user" : "guest");

    // Check rate limit per client
    if (isRateLimited(clientUid)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a few minutes before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const { prompt, profile, focusCondition, language, imageBase64 } = payload;

    if (!prompt && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing required prompt or image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langInstruction =
      language === "hi"
        ? "LANGUAGE: Respond in authentic, compassionate Hindi (Devanagari or natural conversational Hinglish matching user prompt)."
        : "LANGUAGE: Respond in clear, empathetic English.";

    const systemContext = `You are Medi Bud, an expert AI family physician and compassionate health companion for Indian users.
PATIENT PROFILE:
- Age: ${profile?.age || "Not specified"}, Gender: ${profile?.gender || "Not specified"}
- Medical Conditions: ${profile?.healthIssues || "None reported"}
- Current Medications: ${profile?.medications || "None"}
- Allergies: ${profile?.allergies || "None"} (NEVER recommend allergens)
- Focus: ${focusCondition || "General Wellness"}
${langInstruction}

RESPONSE FORMAT RULES:
1. Provide a concise, compassionate, structured answer (4-6 sentences) with actionable guidance.
2. After your text, append an optional <cards> JSON array with 2-3 structured cards:
   Schema: [{"type":"stat"|"tip"|"warn"|"avoid"|"remedy"|"food"|"med", "icon":"check"|"alert"|"heart"|"activity"|"leaf"|"droplet"|"utensils"|"pill"|"shield", "label":"<max 20 chars>", "value":"<short metric>", "text":"<max 80 chars>"}]
3. Always end your text with: *Always consult a certified medical practitioner for definitive clinical decisions.*`;

    const requestParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: `${systemContext}\n\nPatient Query: "${prompt || "Analyze attached medical image"}"\nDoctor Advice:` },
    ];

    if (imageBase64) {
      requestParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: requestParts }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.6,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API returned error: ${geminiRes.status}`, details: errBody }),
        { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal Server Error", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
