jest.mock("@/db/client", () => ({
  fetchSettings: jest.fn().mockReturnValue({ language: "en" }),
  persistSetting: jest.fn(),
}));

import { en, hi, getTranslation } from "@/locales";

describe("Localization (i18n) Parity & Consistency", () => {
  test("getTranslation returns correct locale dictionary", () => {
    expect(getTranslation("en")).toBe(en);
    expect(getTranslation("hi")).toBe(hi);
  });

  test("Hindi locale has all top-level categories matching English", () => {
    const enCategories = Object.keys(en);
    const hiCategories = Object.keys(hi);
    expect(hiCategories).toEqual(expect.arrayContaining(enCategories));
  });

  test("every string in English has a non-empty corresponding string in Hindi", () => {
    for (const [categoryKey, categoryObj] of Object.entries(en)) {
      const hiCategory = (hi as any)[categoryKey];
      expect(hiCategory).toBeDefined();

      for (const [key, value] of Object.entries(categoryObj)) {
        if (typeof value === "string") {
          const hiValue = hiCategory[key];
          expect(typeof hiValue).toBe("string");
          expect(hiValue.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("Hindi translations contain valid Devanagari characters", () => {
    expect(hi.dashboard.title).toBe("स्वास्थ्य विवरण");
    expect(hi.common.save).toBe("बदलाव सहेजें");
    expect(hi.emergency.nationalEmergency).toContain("112");
  });
});
