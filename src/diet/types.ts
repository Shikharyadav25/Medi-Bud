export type DietType = "veg" | "vegan" | "eggetarian" | "non_veg" | "jain";

export type CuisineType =
  | "simple_home"
  | "north_indian"
  | "south_indian"
  | "high_protein";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export type HealthGoal =
  | "weight_loss"
  | "maintain"
  | "muscle_gain"
  | "blood_sugar"
  | "heart_health";

export type MealType =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "evening_snack"
  | "dinner";

export interface MealItem {
  id: string;
  name: string;
  nameHi?: string;
  portion: string;
  portionHi?: string;
  mealType: MealType;
  dietTypes: DietType[];
  cuisines: CuisineType[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumLevel: "low" | "medium" | "high";
  giLevel: "low" | "medium" | "high";
  allergens: string[];
  healthTags: string[];
  prepTip?: string;
  prepTipHi?: string;
}

export interface NutritionalTargets {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterLiters: number;
  bmr: number;
  tdee: number;
}

export interface ClinicalDietaryFlags {
  lowGI: boolean;
  lowSodium: boolean;
  lowSaturatedFat: boolean;
  highFiber: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  peanutFree: boolean;
  eggFree: boolean;
  antiReflux: boolean;
  renalSafe: boolean;
}

export interface ConditionRulesSummary {
  conditionsDetected: string[];
  allergensDetected: string[];
  flags: ClinicalDietaryFlags;
  dos: string[];
  donts: string[];
  clinicalNotes: string[];
}

export interface ScheduledMeal {
  mealType: MealType;
  selectedMeal: MealItem;
  alternatives: MealItem[];
  isCompleted: boolean;
}

export interface DietPlan {
  profileId: number;
  generatedDate: string;
  targets: NutritionalTargets;
  rules: ConditionRulesSummary;
  meals: Record<MealType, ScheduledMeal>;
}

export interface DietPreferences {
  profileId: number;
  dietType: DietType;
  cuisineType: CuisineType;
  activityLevel: ActivityLevel;
  primaryGoal: HealthGoal;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWaterL: number;
  updatedAt: number;
}
