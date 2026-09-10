import { searchMedicalManual } from "@/chat/offline/manualSearchEngine";

describe("manualSearchEngine", () => {
  it("searches and finds acidity and gerd articles", () => {
    const result = searchMedicalManual("what helps with acidity and sour burps?");
    expect(result).not.toBeNull();
    expect(result?.article.id).toBe("gerd_acidity");
    expect(result?.content).toContain("GERD, ACIDITY & HEARTBURN");
    expect(result?.content).toContain("Evidence-Based Home Care");
    expect(result?.cards.length).toBeGreaterThan(0);
  });

  it("searches and finds type 2 diabetes management", () => {
    const result = searchMedicalManual("type 2 diabetes high blood sugar diet");
    expect(result).not.toBeNull();
    expect(result?.article.id).toBe("type2_diabetes");
    expect(result?.content.toLowerCase()).toContain("complex carbohydrates");
  });

  it("searches and finds ankle sprain care", () => {
    const result = searchMedicalManual("twisted swollen ankle ligament");
    expect(result).not.toBeNull();
    expect(result?.article.id).toBe("ankle_sprain");
    expect(result?.content).toContain("Rest: Limit walking");
    expect(result?.cards?.[0].label).toBe("R.I.C.E.");
  });

  it("returns null for query with only stop words or nonsensical queries", () => {
    expect(searchMedicalManual("what is the")).toBeNull();
    expect(searchMedicalManual("xyz123abc")).toBeNull();
  });
});
