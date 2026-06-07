export async function askAI(prompt) {
  return callGemini([{ text: prompt }]);
}

export async function askAIWithImage(prompt, imageBase64, mimeType = "image/jpeg") {
  return callGemini([
    { text: prompt },
    { inlineData: { mimeType: mimeType, data: imageBase64 } }
  ]);
}

async function callGemini(parts) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini response:", data);
    
    if (data?.error) {
      return `Gemini API Error: ${data.error.message} (${data.error.status})`;
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error fetching AI response: ${error?.message || String(error)}`;
  }
}