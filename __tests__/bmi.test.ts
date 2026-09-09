import { calculateBMI } from "../src/lib/bmi";

describe("BMI Calculator Domain Logic", () => {
  test("calculates normal BMI correctly", () => {
    // 70 kg, 175 cm => 70 / (1.75 * 1.75) = 22.86 => 22.9
    const result = calculateBMI(175, 70);
    expect(result).not.toBeNull();
    expect(result?.bmi).toBe(22.9);
    expect(result?.formatted).toBe("22.9");
    expect(result?.category).toBe("Normal");
    expect(result?.isNormal).toBe(true);
  });

  test("classifies underweight BMI correctly (< 18.5)", () => {
    // 45 kg, 170 cm => 45 / (1.7 * 1.7) = 15.57 => 15.6
    const result = calculateBMI(170, 45);
    expect(result?.category).toBe("Underweight");
    expect(result?.isNormal).toBe(false);
  });

  test("classifies overweight BMI correctly (25.0 - 29.9)", () => {
    // 80 kg, 170 cm => 80 / (1.7 * 1.7) = 27.68 => 27.7
    const result = calculateBMI(170, 80);
    expect(result?.category).toBe("Overweight");
    expect(result?.isNormal).toBe(false);
  });

  test("classifies obese BMI correctly (>= 30.0)", () => {
    // 100 kg, 170 cm => 100 / (1.7 * 1.7) = 34.6
    const result = calculateBMI(170, 100);
    expect(result?.category).toBe("Obese");
    expect(result?.isNormal).toBe(false);
  });

  test("returns null for out-of-bounds physiological inputs", () => {
    expect(calculateBMI(0, 70)).toBeNull();
    expect(calculateBMI(170, 0)).toBeNull();
    expect(calculateBMI(30, 70)).toBeNull(); // Height too low (< 50cm)
    expect(calculateBMI(170, 10)).toBeNull(); // Weight too low (< 20kg)
  });
});
