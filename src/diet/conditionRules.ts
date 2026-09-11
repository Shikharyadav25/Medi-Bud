import { ClinicalDietaryFlags, ConditionRulesSummary } from "./types";

export function evaluateConditionRules(
  healthIssues: string,
  allergies: string
): ConditionRulesSummary {
  const normalizedIssues = (healthIssues || "").toLowerCase();
  const normalizedAllergies = (allergies || "").toLowerCase();

  const flags: ClinicalDietaryFlags = {
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
  };

  const conditionsDetected: string[] = [];
  const allergensDetected: string[] = [];
  const dos: string[] = [];
  const donts: string[] = [];
  const clinicalNotes: string[] = [];

  // Diabetes / Blood Sugar
  if (
    normalizedIssues.includes("diabet") ||
    normalizedIssues.includes("sugar") ||
    normalizedIssues.includes("insulin")
  ) {
    conditionsDetected.push("Type 2 Diabetes / Pre-Diabetes");
    flags.lowGI = true;
    flags.highFiber = true;
    dos.push("Prioritize high-fiber legumes, methi, millets, and raw salads before carbs.");
    donts.push("Avoid refined flour (maida), white sugar, fruit juices, and high-GI potatoes.");
    clinicalNotes.push("Pair carbohydrates with protein or healthy fats to flatten post-meal glucose spikes.");
  }

  // Hypertension / High BP
  if (
    normalizedIssues.includes("hypertens") ||
    normalizedIssues.includes("bp") ||
    normalizedIssues.includes("blood pressure")
  ) {
    conditionsDetected.push("Hypertension (High BP)");
    flags.lowSodium = true;
    dos.push("Emphasize potassium-rich foods (banana, coconut water, spinach, dahi).");
    donts.push("Strictly restrict table salt, papad, commercial pickles, packaged namkeens, and canned soups.");
    clinicalNotes.push("DASH eating guidelines target sodium under 1,500mg daily.");
  }

  // High Cholesterol / Heart Disease
  if (
    normalizedIssues.includes("cholesterol") ||
    normalizedIssues.includes("lipid") ||
    normalizedIssues.includes("heart") ||
    normalizedIssues.includes("cardiac")
  ) {
    conditionsDetected.push("Hyperlipidemia / Heart Health");
    flags.lowSaturatedFat = true;
    flags.highFiber = true;
    dos.push("Include soluble fiber like oats, chia seeds, walnuts, and cold-pressed mustard or olive oil.");
    donts.push("Eliminate deep-fried savories, palm oil, vanaspati ghee, and trans-fat baked snacks.");
  }

  // Acid Reflux / GERD
  if (
    normalizedIssues.includes("acid") ||
    normalizedIssues.includes("reflux") ||
    normalizedIssues.includes("gerd") ||
    normalizedIssues.includes("heartburn")
  ) {
    conditionsDetected.push("Acid Reflux (GERD)");
    flags.antiReflux = true;
    dos.push("Eat smaller, frequent meals and maintain an upright posture for 2 hours post-meal.");
    donts.push("Avoid heavy late-night dinners, excess chili, raw tomatoes, citrus juices, and carbonated beverages.");
  }

  // PCOS / Thyroid
  if (normalizedIssues.includes("pcos") || normalizedIssues.includes("pcod")) {
    conditionsDetected.push("PCOS / Insulin Resistance");
    flags.lowGI = true;
    flags.highFiber = true;
    dos.push("Balance every plate with lean protein, anti-inflammatory spices (haldi, cinnamon), and seeds.");
    donts.push("Limit refined carbohydrates, sugary desserts, and ultra-processed bakery items.");
  } else if (normalizedIssues.includes("thyroid")) {
    conditionsDetected.push("Thyroid Health");
    dos.push("Ensure adequate selenium and iodine intake via nuts, seeds, and fortified salts.");
    donts.push("Cook cruciferous vegetables (cabbage, cauliflower, broccoli) well rather than consuming raw.");
  }

  // Allergies & Food Intolerances
  if (
    normalizedAllergies.includes("milk") ||
    normalizedAllergies.includes("dairy") ||
    normalizedAllergies.includes("lactose") ||
    normalizedAllergies.includes("paneer")
  ) {
    allergensDetected.push("Dairy / Lactose Intolerance");
    flags.dairyFree = true;
    donts.push("Strictly exclude cow's milk, paneer, regular curd, and whey.");
    dos.push("Substitute with fortified plant milks (almond/soy/oats) and tofu.");
  }

  if (
    normalizedAllergies.includes("gluten") ||
    normalizedAllergies.includes("wheat") ||
    normalizedAllergies.includes("celiac")
  ) {
    allergensDetected.push("Gluten / Celiac Sensitivity");
    flags.glutenFree = true;
    donts.push("Eliminate wheat, atta rotis, maida, semolina (sooji), and barley.");
    dos.push("Use certified gluten-free grains: jowar, bajra, ragi, brown rice, and quinoa.");
  }

  if (
    normalizedAllergies.includes("peanut") ||
    normalizedAllergies.includes("groundnut") ||
    normalizedAllergies.includes("nut")
  ) {
    allergensDetected.push("Peanut / Tree Nut Allergy");
    flags.peanutFree = true;
    donts.push("Check ingredient labels carefully for peanut oil, traces, and mixed nut butters.");
  }

  if (normalizedAllergies.includes("egg")) {
    allergensDetected.push("Egg Allergy");
    flags.eggFree = true;
    donts.push("Exclude whole eggs, egg whites, and baked products containing egg albumin.");
  }

  if (dos.length === 0) {
    dos.push("Drink 8-10 glasses of water, consume colorful seasonal vegetables, and keep meal timings consistent.");
  }
  if (donts.length === 0) {
    donts.push("Minimize refined sugars, deep-fried snacks, and ultra-processed packaged meals.");
  }

  return {
    conditionsDetected,
    allergensDetected,
    flags,
    dos,
    donts,
    clinicalNotes,
  };
}
