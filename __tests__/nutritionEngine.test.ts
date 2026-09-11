import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionalTargets,
} from "../src/diet/nutritionEngine";

describe("Nutrition Engine Calculations", () => {
  test("calculates male BMR accurately using Mifflin-St Jeor", () => {
    // Male: 70kg, 175cm, 30y => 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75 => 1649
    const bmr = calculateBMR("Male", 30, 175, 70);
    expect(bmr).toBe(1649);
  });

  test("calculates female BMR accurately using Mifflin-St Jeor", () => {
    // Female: 60kg, 160cm, 28y => 10*60 + 6.25*160 - 5*28 - 161 = 600 + 1000 - 140 - 161 = 1299
    const bmr = calculateBMR("Female", 28, 160, 60);
    expect(bmr).toBe(1299);
  });

  test("calculates TDEE based on activity levels", () => {
    const bmr = 1500;
    expect(calculateTDEE(bmr, "sedentary")).toBe(1800); // 1.2
    expect(calculateTDEE(bmr, "light")).toBe(2063); // 1.375
    expect(calculateTDEE(bmr, "moderate")).toBe(2325); // 1.55
    expect(calculateTDEE(bmr, "active")).toBe(2588); // 1.725
  });

  test("applies caloric deficit for weight loss respecting minimum bounds", () => {
    // Female with low TDEE
    const targets = calculateNutritionalTargets(
      "Female",
      40,
      150,
      48,
      "sedentary",
      "weight_loss"
    );
    // Even if TDEE - 400 is lower, it should not drop below 1200
    expect(targets.dailyCalories).toBeGreaterThanOrEqual(1200);
  });

  test("calculates water intake proportionally to body weight", () => {
    // 70kg * 0.033 = 2.31 => 2.3L
    const targets = calculateNutritionalTargets(
      "Male",
      30,
      175,
      70,
      "moderate",
      "maintain"
    );
    expect(targets.waterLiters).toBe(2.3);
    expect(targets.proteinG).toBeGreaterThan(50);
  });
});
