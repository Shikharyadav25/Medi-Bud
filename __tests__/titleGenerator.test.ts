import { generateTitleFromPrompt } from "../src/chat/titleGenerator";

describe("generateTitleFromPrompt", () => {
  it("returns default title for empty or whitespace prompts", () => {
    expect(generateTitleFromPrompt("")).toBe("Health Consultation");
    expect(generateTitleFromPrompt("   ")).toBe("Health Consultation");
  });

  it("strips common conversational fillers and capitalizes words", () => {
    const title = generateTitleFromPrompt("Hello doctor please help me with severe chest pain");
    expect(title).toBe("Severe Chest Pain");
  });

  it("cleans punctuation marks from prompt", () => {
    const title = generateTitleFromPrompt("Can you tell me about high fever? It's really bad!");
    expect(title).toBe("High Fever Its Really Bad");
  });

  it("truncates very long prompts with ellipsis", () => {
    const longPrompt = "Extremely long description of symptoms that goes on and on and on beyond normal limits";
    const title = generateTitleFromPrompt(longPrompt);
    expect(title.length).toBeLessThanOrEqual(34);
    expect(title.endsWith("...")).toBe(true);
  });
});
