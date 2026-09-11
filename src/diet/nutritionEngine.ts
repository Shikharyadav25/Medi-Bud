import { ActivityLevel, HealthGoal, NutritionalTargets } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const MIN_CALORIES_FEMALE = 1200;
const MIN_CALORIES_MALE = 1500;
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

export function calculateBMR(
  gender: string,
  age: number,
  heightCm: number,
  weightKg: number
): number {
  const normalizedGender = gender.toLowerCase();
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (normalizedGender === "female" || normalizedGender === "f") {
    return Math.round(base - 161);
  }
  if (normalizedGender === "male" || normalizedGender === "m") {
    return Math.round(base + 5);
  }
  return Math.round(base - 78);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateNutritionalTargets(
  gender: string,
  age: number,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel,
  goal: HealthGoal
): NutritionalTargets {
  const bmr = calculateBMR(gender, age, heightCm, weightKg);
  const tdee = calculateTDEE(bmr, activityLevel);

  let targetCalories = tdee;
  const isFemale = gender.toLowerCase() === "female" || gender.toLowerCase() === "f";
  const minCalories = isFemale ? MIN_CALORIES_FEMALE : MIN_CALORIES_MALE;

  switch (goal) {
    case "weight_loss":
      targetCalories = Math.max(minCalories, tdee - 400);
      break;
    case "muscle_gain":
      targetCalories = tdee + 350;
      break;
    case "blood_sugar":
    case "heart_health": {
      const heightM = heightCm / 100;
      const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 22;
      targetCalories = bmi >= 25 ? Math.max(minCalories, tdee - 250) : tdee;
      break;
    }
    case "maintain":
    default:
      targetCalories = tdee;
      break;
  }

  let proteinPct = 0.2;
  let carbsPct = 0.55;
  let fatPct = 0.25;
  let fiberG = 28;

  if (goal === "muscle_gain") {
    proteinPct = 0.28;
    carbsPct = 0.47;
    fatPct = 0.25;
    fiberG = 30;
  } else if (goal === "blood_sugar") {
    proteinPct = 0.25;
    carbsPct = 0.4;
    fatPct = 0.35;
    fiberG = 38;
  } else if (goal === "heart_health") {
    proteinPct = 0.2;
    carbsPct = 0.55;
    fatPct = 0.25;
    fiberG = 35;
  } else if (goal === "weight_loss") {
    proteinPct = 0.27;
    carbsPct = 0.45;
    fatPct = 0.28;
    fiberG = 32;
  }

  const proteinG = Math.round((targetCalories * proteinPct) / KCAL_PER_G_PROTEIN);
  const carbsG = Math.round((targetCalories * carbsPct) / KCAL_PER_G_CARBS);
  const fatG = Math.round((targetCalories * fatPct) / KCAL_PER_G_FAT);

  const waterLiters = Math.round(weightKg * 0.033 * 10) / 10;

  return {
    dailyCalories: targetCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    waterLiters: Math.max(1.8, Math.min(4.5, waterLiters)),
    bmr,
    tdee,
  };
}
