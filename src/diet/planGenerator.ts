import { MEAL_CATALOG } from "./mealCatalog";
import {
  DietPlan,
  DietPreferences,
  MealItem,
  MealType,
  NutritionalTargets,
  ScheduledMeal,
  ConditionRulesSummary,
} from "./types";

const MEAL_SLOTS: MealType[] = [
  "breakfast",
  "morning_snack",
  "lunch",
  "evening_snack",
  "dinner",
];

export function filterSafeMeals(
  catalog: MealItem[],
  mealType: MealType,
  preferences: DietPreferences,
  rules: ConditionRulesSummary
): MealItem[] {
  const { dietType, cuisineType } = preferences;
  const { flags } = rules;

  return catalog.filter((meal) => {
    if (meal.mealType !== mealType) return false;

    // Diet style compatibility
    if (!meal.dietTypes.includes(dietType)) {
      return false;
    }

    // Allergen exclusion
    if (flags.dairyFree && meal.allergens.includes("dairy")) return false;
    if (flags.glutenFree && meal.allergens.includes("gluten")) return false;
    if (flags.peanutFree && meal.allergens.includes("peanut")) return false;
    if (flags.eggFree && meal.allergens.includes("egg")) return false;

    // Clinical restrictions
    if (flags.lowSodium && meal.sodiumLevel === "high") return false;
    if (flags.lowGI && meal.giLevel === "high") return false;

    return true;
  }).sort((a, b) => {
    // Prefer user's selected cuisine when possible
    const aCuisineMatch = a.cuisines.includes(cuisineType) ? 1 : 0;
    const bCuisineMatch = b.cuisines.includes(cuisineType) ? 1 : 0;
    return bCuisineMatch - aCuisineMatch;
  });
}

export function generateDietPlan(
  profileId: number,
  preferences: DietPreferences,
  targets: NutritionalTargets,
  rules: ConditionRulesSummary,
  completedMap?: Record<string, boolean>
): DietPlan {
  const todayStr = new Date().toISOString().split("T")[0];
  const mealsRecord: Partial<Record<MealType, ScheduledMeal>> = {};

  for (const slot of MEAL_SLOTS) {
    const candidates = filterSafeMeals(MEAL_CATALOG, slot, preferences, rules);

    // Fallback: If strict filters yielded no candidates, relax non-allergen constraints
    let finalPool = candidates;
    if (finalPool.length === 0) {
      finalPool = MEAL_CATALOG.filter(
        (m) =>
          m.mealType === slot &&
          (!flagsHasAllergen(rules, m.allergens))
      );
    }

    const selectedMeal = finalPool[0] || MEAL_CATALOG.find((m) => m.mealType === slot)!;
    const alternatives = finalPool.filter((m) => m.id !== selectedMeal.id);

    mealsRecord[slot] = {
      mealType: slot,
      selectedMeal,
      alternatives,
      isCompleted: completedMap ? !!completedMap[slot] : false,
    };
  }

  return {
    profileId,
    generatedDate: todayStr,
    targets,
    rules,
    meals: mealsRecord as Record<MealType, ScheduledMeal>,
  };
}

function flagsHasAllergen(rules: ConditionRulesSummary, allergens: string[]): boolean {
  if (rules.flags.dairyFree && allergens.includes("dairy")) return true;
  if (rules.flags.glutenFree && allergens.includes("gluten")) return true;
  if (rules.flags.peanutFree && allergens.includes("peanut")) return true;
  if (rules.flags.eggFree && allergens.includes("egg")) return true;
  return false;
}
