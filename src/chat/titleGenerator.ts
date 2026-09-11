/**
 * Generates a clean, concise conversation title from the user's first prompt.
 */
export function generateTitleFromPrompt(prompt: string): string {
  if (!prompt || !prompt.trim()) {
    return "Health Consultation";
  }

  let cleaned = prompt.trim();

  // Repeatedly strip leading conversational fillers
  const fillerRegex =
    /^(hello|hi|hey|dr\.?|doctor|please|can you|could you|tell me about|what is|what are|help me with|i have|i am having|i'm having|i feel|check my)\s+/i;
  
  while (fillerRegex.test(cleaned)) {
    cleaned = cleaned.replace(fillerRegex, "").trim();
  }

  // Remove punctuation marks
  cleaned = cleaned.replace(/[?!.,;:"'(){}[\]]/g, "").trim();

  if (!cleaned) {
    cleaned = prompt.trim();
  }

  // Take first 5 words
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 5);
  let title = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Limit to 34 characters and trim trailing whitespace
  if (title.length > 34) {
    title = title.substring(0, 31).trim() + "...";
  }

  return title || "Health Consultation";
}
