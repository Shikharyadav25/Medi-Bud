import { evaluateConditionRules } from "../src/diet/conditionRules";

describe("Condition Rules Clinical Engine", () => {
  test("detects Type 2 Diabetes and sets low-GI and high-fiber flags", () => {
    const summary = evaluateConditionRules("Type 2 Diabetes, mild fatigue", "");
    expect(summary.conditionsDetected).toContain("Type 2 Diabetes / Pre-Diabetes");
    expect(summary.flags.lowGI).toBe(true);
    expect(summary.flags.highFiber).toBe(true);
    expect(summary.dos.some((d) => d.toLowerCase().includes("fiber"))).toBe(true);
  });

  test("detects Hypertension and sets low-sodium flag", () => {
    const summary = evaluateConditionRules("High blood pressure, BP 140/90", "");
    expect(summary.conditionsDetected).toContain("Hypertension (High BP)");
    expect(summary.flags.lowSodium).toBe(true);
    expect(summary.donts.some((d) => d.toLowerCase().includes("salt"))).toBe(true);
  });

  test("detects multiple conditions and allergies simultaneously", () => {
    const summary = evaluateConditionRules(
      "Diabetes, high cholesterol, GERD",
      "Lactose, peanuts"
    );
    expect(summary.flags.lowGI).toBe(true);
    expect(summary.flags.lowSaturatedFat).toBe(true);
    expect(summary.flags.antiReflux).toBe(true);
    expect(summary.flags.dairyFree).toBe(true);
    expect(summary.flags.peanutFree).toBe(true);
    expect(summary.allergensDetected).toContain("Dairy / Lactose Intolerance");
    expect(summary.allergensDetected).toContain("Peanut / Tree Nut Allergy");
  });

  test("provides sensible defaults when no conditions or allergies are reported", () => {
    const summary = evaluateConditionRules("", "");
    expect(summary.conditionsDetected.length).toBe(0);
    expect(summary.allergensDetected.length).toBe(0);
    expect(summary.dos.length).toBeGreaterThan(0);
    expect(summary.donts.length).toBeGreaterThan(0);
  });
});
