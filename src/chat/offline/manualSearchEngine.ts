import { ManualArticle, MedicalCard } from "../types";
import { MEDICAL_MANUAL } from "./medicalManualData";

export interface ManualSearchResult {
  article: ManualArticle;
  score: number;
  content: string;
  cards: MedicalCard[];
}

const STOP_WORDS = new Set([
  "the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "for",
  "with", "about", "against", "between", "into", "through", "during", "before",
  "after", "above", "below", "to", "from", "up", "down", "in", "out", "on",
  "off", "over", "under", "again", "further", "then", "once", "here", "there",
  "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "can", "will", "just", "don", "should", "now",
  "what", "help", "helps", "remedy", "cure", "treatment", "medicine", "my",
  "i", "have", "suffering", "having", "please", "tell", "give", "advice",
]);

export function searchMedicalManual(query: string): ManualSearchResult | null {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return null;

  let bestArticle: ManualArticle | null = null;
  let highestScore = 0;

  for (const article of MEDICAL_MANUAL) {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const overviewLower = article.overview.toLowerCase();
    const categoryLower = article.category.toLowerCase();

    for (const token of tokens) {
      if (titleLower.includes(token)) score += 8;
      if (categoryLower.includes(token)) score += 3;

      for (const kw of article.keywords) {
        if (kw.toLowerCase().includes(token)) score += 6;
      }

      if (overviewLower.includes(token)) score += 2;

      if (article.symptoms?.some((s) => s.toLowerCase().includes(token))) {
        score += 3;
      }
      if (article.remedies?.some((r) => r.toLowerCase().includes(token))) {
        score += 3;
      }
    }

    if (score > highestScore && score >= 5) {
      highestScore = score;
      bestArticle = article;
    }
  }

  if (!bestArticle) return null;

  const formatted = formatArticleResponse(bestArticle);

  return {
    article: bestArticle,
    score: highestScore,
    content: formatted.content,
    cards: formatted.cards,
  };
}

function formatArticleResponse(article: ManualArticle): {
  content: string;
  cards: MedicalCard[];
} {
  const lines: string[] = [];

  lines.push(`📖 **OFFLINE MEDICAL MANUAL: ${article.title.toUpperCase()}**`);
  lines.push(`*Category: ${article.category}*\n`);
  lines.push(`${article.overview}\n`);

  if (article.remedies && article.remedies.length > 0) {
    lines.push(`**Evidence-Based Home Care:**`);
    article.remedies.forEach((r) => lines.push(`• ${r}`));
    lines.push("");
  }

  if (article.dietaryTips && article.dietaryTips.length > 0) {
    lines.push(`**Dietary & Lifestyle Advice:**`);
    article.dietaryTips.forEach((d) => lines.push(`• ${d}`));
    lines.push("");
  }

  if (article.whenToSeeDoctor && article.whenToSeeDoctor.length > 0) {
    lines.push(`**When to Consult a Physician:**`);
    article.whenToSeeDoctor.forEach((w) => lines.push(`• ${w}`));
    lines.push("");
  }

  lines.push(`*Verified offline medical entry. Consult your doctor for tailored clinical advice.*`);

  return {
    content: lines.join("\n"),
    cards: article.cards || [],
  };
}
