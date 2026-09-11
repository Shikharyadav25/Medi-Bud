import {
  isPediatricProfile,
  getPediatricSafetyGuidance,
} from "@/triage/pediatricGuard";
import { UserProfile } from "@/lib/types";

describe("Pediatric Clinical Safety Guardrail", () => {
  const adultProfile: UserProfile = {
    id: 1,
    uid: "prof_adult",
    accountId: "acc_1",
    name: "Rohan",
    relationship: "self",
    age: 32,
    gender: "Male",
    heightCm: 175,
    weightKg: 75,
    healthIssues: "",
    medications: "",
    allergies: "",
    updatedAt: 1700000000,
    syncStatus: "synced",
  };

  const childByAgeProfile: UserProfile = {
    ...adultProfile,
    id: 2,
    name: "Aarav",
    relationship: "child",
    age: 8,
  };

  const teenProfile: UserProfile = {
    ...adultProfile,
    id: 3,
    name: "Ananya",
    relationship: "other",
    age: 15,
  };

  test("correctly identifies pediatric profiles by age and relationship", () => {
    expect(isPediatricProfile(childByAgeProfile)).toBe(true);
    expect(isPediatricProfile(teenProfile)).toBe(true);
    expect(isPediatricProfile(adultProfile)).toBe(false);
    expect(isPediatricProfile(null)).toBe(false);
  });

  test("provides comprehensive clinical precautions in English for children", () => {
    const guidance = getPediatricSafetyGuidance(childByAgeProfile, "en");
    expect(guidance.isRestricted).toBe(true);
    expect(guidance.title).toContain("Pediatric");
    expect(guidance.keyPrecautions.length).toBeGreaterThanOrEqual(3);
    expect(guidance.recommendedAction).toContain("pediatrician");
  });

  test("provides authentic Hindi guidance when language is hi", () => {
    const guidance = getPediatricSafetyGuidance(childByAgeProfile, "hi");
    expect(guidance.isRestricted).toBe(true);
    expect(guidance.title).toContain("बाल सुरक्षा");
    expect(guidance.recommendedAction).toContain("बाल रोग विशेषज्ञ");
  });

  test("does not restrict adult profiles", () => {
    const guidance = getPediatricSafetyGuidance(adultProfile, "en");
    expect(guidance.isRestricted).toBe(false);
    expect(guidance.keyPrecautions).toHaveLength(0);
  });
});
