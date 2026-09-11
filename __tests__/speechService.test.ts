jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { cleanTextForSpeech } from "../src/services/speechService";

describe("cleanTextForSpeech", () => {
  it("strips XML/card tags from AI response", () => {
    const raw = "Here is your treatment.<cards>[{\"type\":\"med\"}]</cards> Stay hydrated.";
    expect(cleanTextForSpeech(raw)).toBe("Here is your treatment. Stay hydrated.");
  });

  it("strips markdown formatting including asterisks, backticks, and links", () => {
    const raw = "Please take **paracetamol** and check [hospital link](https://hospital.org).";
    expect(cleanTextForSpeech(raw)).toBe("Please take paracetamol and check hospital link.");
  });

  it("handles empty or whitespace strings gracefully", () => {
    expect(cleanTextForSpeech("")).toBe("");
    expect(cleanTextForSpeech("   ")).toBe("");
  });
});
