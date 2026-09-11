import { generateDietPlan } from "../src/diet/planGenerator";
import { DietPreferences, NutritionalTargets, ConditionRulesSummary } from "../src/diet/types";

describe("Diet Plan Generator", () => {
  const dummyTargets: NutritionalTargets = {
    dailyCalories: 1800,
    proteinG: 90,
    carbsG: 220,
    fatG: 50,
    fiberG: 30,
    waterLiters: 2.3,
    bmr: 1500,
    tdee: 1800,
  };

  const vegetarianPrefs: DietPreferences = {
    profileId: 1,
    dietType: "veg",
    cuisineType: "simple_home",
    activityLevel: "moderate",
    primaryGoal: "maintain",
    targetCalories: 1800,
    targetProtein: 90,
    targetCarbs: 220,
    targetFats: 50,
    targetWaterL: 2.3,
    updatedAt: Date.now(),
  };

  test("generates all 5 meal slots for a vegetarian plan without non-veg items", () => {
    const defaultRules: ConditionRulesSummary = {
      conditionsDetected: [],
      allergensDetected: [],
      flags: {
        lowGI: false,
        lowSodium: false,
        lowSaturatedFat: false,
        highFiber: false,
        dairyFree: false,
        glutenFree: false,
        peanutFree: false,
        eggFree: false,
        antiReflux: false,
        renalSafe: false,
      },
      dos: [],
      donts: [],
      clinicalNotes: [],
    };

    const plan = generateDietPlan(1, vegetarianPrefs, dummyTargets, defaultRules);

    expect(plan.meals.breakfast).toBeDefined();
    expect(plan.meals.morning_snack).toBeDefined();
    expect(plan.meals.lunch).toBeDefined();
    expect(plan.meals.evening_snack).toBeDefined();
    expect(plan.meals.dinner).toBeDefined();

    // Verify all selected meals accommodate vegetarian diet
    Object.values(plan.meals).forEach((scheduled) => {
      expect(scheduled.selectedMeal.dietTypes).toContain("veg");
    });
  });

  test("strictly excludes gluten when gluten-free flag is active", () => {
    const glutenFreeRules: ConditionRulesSummary = {
      conditionsDetected: ["Celiac Disease"],
      allergensDetected: ["Gluten"],
      flags: {
        lowGI: false,
        lowSodium: false,
        lowSaturatedFat: false,
        highFiber: false,
        dairyFree: false,
        glutenFree: true,
        peanutFree: false,
        eggFree: false,
        antiReflux: false,
        renalSafe: false,
      },
      dos: [],
      donts: [],
      clinicalNotes: [],
    };

    const plan = generateDietPlan(1, vegetarianPrefs, dummyTargets, glutenFreeRules);

    Object.values(plan.meals).forEach((scheduled) => {
      expect(scheduled.selectedMeal.allergens).not.toContain("gluten");
    });
  });
});
