export type BMICategory = "Underweight" | "Normal" | "Overweight" | "Obese";

export interface BMIResult {
  bmi: number;
  formatted: string;
  category: BMICategory;
  isNormal: boolean;
}

/**
 * Calculates Body Mass Index (BMI) using height in cm and weight in kg.
 * Returns null if inputs are outside realistic physiological bounds.
 */
export function calculateBMI(
  heightCm: number,
  weightKg: number
): BMIResult | null {
  if (
    !heightCm ||
    !weightKg ||
    heightCm < 50 ||
    heightCm > 260 ||
    weightKg < 20 ||
    weightKg > 350
  ) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiValue = weightKg / (heightM * heightM);
  const roundedBMI = Math.round(bmiValue * 10) / 10;

  let category: BMICategory;
  if (roundedBMI < 18.5) {
    category = "Underweight";
  } else if (roundedBMI < 24.9) {
    category = "Normal";
  } else if (roundedBMI < 29.9) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  return {
    bmi: roundedBMI,
    formatted: roundedBMI.toFixed(1),
    category,
    isNormal: category === "Normal",
  };
}
