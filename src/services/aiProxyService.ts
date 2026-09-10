import { MedicalCard } from "@/chat/types";
import { UserProfile } from "@/lib/types";
import { calculateBMI } from "@/lib/bmi";

export interface AIResponse {
  text: string;
  cards: MedicalCard[];
}

export async function queryCloudDoctor(
  prompt: string,
  profile: UserProfile | null,
  focusCondition?: string,
  language = "en",
  imageBase64?: string
): Promise<AIResponse> {
  const apiKey =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  const bmiInfo = profile
    ? calculateBMI(profile.heightCm, profile.weightKg)
    : null;

  const langInstruction =
    language === "hi"
      ? "LANGUAGE: Respond in authentic, compassionate Hindi (Devanagari or natural conversational Hinglish matching user prompt)."
      : "LANGUAGE: Respond in the patient's language (default English).";

  const imageInstruction = imageBase64
    ? "IMAGE ANALYSIS: The patient has attached an image (e.g. rash, injury, medication, or food item). Carefully analyze visual indicators, describe key observations, provide actionable safety precautions, and clarify red flags."
    : "";

  const systemContext = `You are Medi Bud, an expert AI family physician and empathetic health companion.
PATIENT PROFILE:
- Age: ${profile?.age || "Not specified"}, Gender: ${profile?.gender || "Not specified"}
- BMI: ${bmiInfo ? `${bmiInfo.bmi} (${bmiInfo.category})` : "N/A"}
- Medical Conditions: ${profile?.healthIssues || "None reported"}
- Current Medications: ${profile?.medications || "None"}
- Allergies: ${profile?.allergies || "None"} (NEVER recommend allergens)
- Focus: ${focusCondition || "General Wellness"}
${langInstruction}
${imageInstruction}

RESPONSE FORMAT RULES:
1. Provide a concise, compassionate, structured answer (4-6 sentences) with actionable guidance.
2. After your text, append an optional <cards> JSON array with 2-3 structured cards:
   Schema: [{"type":"stat"|"tip"|"warn"|"avoid"|"remedy"|"food"|"med", "icon":"check"|"alert"|"heart"|"activity"|"leaf"|"droplet"|"utensils"|"pill"|"shield", "label":"<max 20 chars>", "value":"<short metric>", "text":"<max 80 chars>"}]
3. Always end your text with: *Always consult a certified medical practitioner for definitive clinical decisions.*`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const requestParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: `${systemContext}\n\nPatient Query: "${prompt}"\nDoctor Advice:` },
  ];

  if (imageBase64) {
    requestParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: requestParts }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.6,
          },
        }),
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Cloud API HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawContent) {
      throw new Error("Empty response from AI service");
    }

    return parseAiCards(rawContent);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function parseAiCards(raw: string): AIResponse {
  const cardMatch = raw.match(/<cards>([\s\S]*?)<\/cards>/i);
  let cards: MedicalCard[] = [];

  if (cardMatch && cardMatch[1]) {
    try {
      const parsed = JSON.parse(cardMatch[1].trim());
      if (Array.isArray(parsed)) {
        cards = parsed;
      }
    } catch {
      // Ignore invalid card JSON
    }
  }

  const cleanText = raw.replace(/<cards>[\s\S]*?<\/cards>/i, "").trim();

  return {
    text: cleanText,
    cards,
  };
}
