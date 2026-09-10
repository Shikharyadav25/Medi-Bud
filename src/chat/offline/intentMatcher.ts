import { HealthIntent, MedicalCard } from "../types";
import { HEALTH_INTENTS } from "./intentData";

export interface IntentMatchResult {
  intent: HealthIntent;
  score: number;
  content: string;
  cards: MedicalCard[];
}

export function matchHealthIntent(query: string): IntentMatchResult | null {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return null;

  let bestIntent: HealthIntent | null = null;
  let highestScore = 0;

  for (const intent of HEALTH_INTENTS) {
    let score = 0;

    // Check regex patterns
    if (intent.regexPatterns) {
      for (const pattern of intent.regexPatterns) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(normalizedQuery)) {
          score += 10;
          break;
        }
      }
    }

    // Check keyword presence
    for (const keyword of intent.keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (normalizedQuery === lowerKeyword) {
        score += 8;
      } else if (normalizedQuery.includes(lowerKeyword)) {
        score += 4;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestIntent = intent;
    }
  }

  if (!bestIntent) return null;

  const formatted = formatIntentMessage(bestIntent);

  return {
    intent: bestIntent,
    score: highestScore,
    content: formatted.content,
    cards: formatted.cards,
  };
}

function formatIntentMessage(intent: HealthIntent): {
  content: string;
  cards: MedicalCard[];
} {
  const lines: string[] = [];

  // Urgency & Header
  if (intent.urgency === "emergency") {
    lines.push(`🚨 **EMERGENCY FIRST-AID PROTOCOL: ${intent.title.toUpperCase()}**`);
    lines.push(`*If life-threatening or worsening, call 112 / 911 immediately.*\n`);
  } else if (intent.urgency === "soon") {
    lines.push(`⚠️ **URGENT CARE INSTRUCTIONS: ${intent.title}**\n`);
  } else {
    lines.push(`📋 **FIRST-AID GUIDELINE: ${intent.title}**\n`);
  }

  // Immediate Steps
  lines.push(`**Immediate Steps:**`);
  intent.immediateSteps.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step}`);
  });

  // Red Flags
  if (intent.redFlags && intent.redFlags.length > 0) {
    lines.push(`\n**Seek Immediate Emergency Room Care If:**`);
    intent.redFlags.forEach((rf) => lines.push(`• ${rf}`));
  }

  // Do Not Do
  if (intent.doNotDo && intent.doNotDo.length > 0) {
    lines.push(`\n**Critical Precautions:**`);
    intent.doNotDo.forEach((d) => lines.push(`• ${d}`));
  }

  lines.push(`\n*Offline verified medical protocol. Always consult a healthcare professional.*`);

  return {
    content: lines.join("\n"),
    cards: intent.cards || [],
  };
}
