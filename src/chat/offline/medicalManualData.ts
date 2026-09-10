import { ManualArticle } from "../types";

export const MEDICAL_MANUAL: ManualArticle[] = [
  {
    id: "gerd_acidity",
    title: "GERD, Acidity & Heartburn Management",
    category: "Gastroenterology",
    keywords: ["acidity", "gerd", "heartburn", "acid reflux", "sour burps", "indigestion"],
    overview: "Gastroesophageal reflux occurs when stomach acid frequently flows back into the esophagus, irritating the lining. Common triggers include spicy foods, citrus, mint, chocolate, caffeine, and lying down after meals.",
    symptoms: ["Burning chest sensation (behind breastbone)", "Sour acid taste in mouth", "Difficulty swallowing", "Lump in throat sensation"],
    remedies: [
      "Sip cold milk or tender coconut water to soothe the esophagus.",
      "Stay upright for at least 2-3 hours after finishing any meal.",
      "Elevate the head of your bed by 6 inches with risers.",
      "Chew sugar-free gum for 30 minutes after eating to stimulate saliva.",
    ],
    dietaryTips: [
      "Avoid citrus fruits, tomatoes, fried snacks, raw onions, and carbonated sodas.",
      "Eat smaller, more frequent meals rather than large heavy dinners.",
    ],
    whenToSeeDoctor: [
      "Chest pain accompanied by left arm radiating pain or shortness of breath",
      "Difficulty or pain while swallowing solid foods",
      "Persistent symptoms occurring more than twice per week despite antacids",
    ],
    cards: [
      { type: "remedy", icon: "leaf", label: "Cold Milk", text: "Cold milk or coconut water offers immediate acid buffering." },
      { type: "tip", icon: "utensils", label: "Stay Upright", text: "Do not recline or sleep for 2-3 hours after eating." },
      { type: "avoid", icon: "x", label: "Avoid Triggers", text: "Limit raw onions, deep-fried snacks, and black tea/coffee." },
    ],
  },
  {
    id: "type2_diabetes",
    title: "Type 2 Diabetes Diet & Glucose Control",
    category: "Endocrinology",
    keywords: ["diabetes", "high sugar", "type 2 diabetes", "glycemic control", "hba1c", "blood glucose"],
    overview: "Type 2 diabetes is characterized by insulin resistance and relative insulin deficiency. Consistent dietary management, portion control, and regular physical activity are cornerstones of glycemic control.",
    symptoms: ["Increased thirst (polydipsia)", "Frequent urination (polyuria)", "Unexplained fatigue", "Slow healing sores"],
    remedies: [
      "Engage in a 15-minute brisk walk immediately following main meals to blunt glucose spikes.",
      "Maintain consistent meal timings to avoid sharp glycemic swings.",
      "Ensure adequate hydration with 2.5–3 liters of plain water daily.",
    ],
    dietaryTips: [
      "Favor complex carbohydrates: whole grains (millets, oats, barley) over polished white rice and maida.",
      "Fill half your plate with non-starchy vegetables (greens, cucumbers, bell peppers, beans).",
      "Include lean protein with every meal: lentils, eggs, paneer, tofu, fish.",
    ],
    whenToSeeDoctor: [
      "Fasting blood glucose consistently above 180 mg/dL or below 70 mg/dL",
      "Fruity breath odor with nausea/vomiting (suspected DKA/hyperglycemic state)",
      "Numbness or burning in feet (diabetic peripheral neuropathy)",
    ],
    cards: [
      { type: "stat", icon: "activity", label: "Post-Meal Walk", value: "15 Mins", text: "Brisk walk after meals dramatically blunts glucose spikes." },
      { type: "food", icon: "utensils", label: "Complex Carbs", text: "Swap white rice for millets, dal, and green vegetables." },
      { type: "warn", icon: "alert", label: "Low Sugar Alert", text: "Treat glucose <70 mg/dL immediately with 15g fast carbs." },
    ],
  },
  {
    id: "hypertension",
    title: "Hypertension (High Blood Pressure) Care",
    category: "Cardiology",
    keywords: ["bp", "blood pressure", "hypertension", "high bp", "systolic", "salt intake"],
    overview: "Hypertension is a chronic elevation of systemic arterial blood pressure (≥ 130/80 mmHg). Known as the 'silent killer' because it rarely causes noticeable symptoms until complications occur.",
    symptoms: ["Often asymptomatic", "Morning headaches in severe cases", "Dizziness or facial flushing", "Shortness of breath with exertion"],
    remedies: [
      "Adopt the DASH (Dietary Approaches to Stop Hypertension) dietary pattern.",
      "Restrict daily sodium intake to under 1,500–2,000 mg (less than 1 teaspoon of table salt).",
      "Practice 10-15 minutes of slow rhythmic deep breathing daily to reduce sympathetic tone.",
    ],
    dietaryTips: [
      "Consume potassium-rich foods: bananas, spinach, sweet potatoes, and coconut water (if kidney function is normal).",
      "Strictly avoid packaged chips, papads, pickles, and processed meats high in hidden sodium.",
    ],
    whenToSeeDoctor: [
      "Blood pressure reading ≥ 180/120 mmHg (Hypertensive Urgency / Crisis)",
      "Chest pain, severe headache, or visual disturbances with elevated BP",
    ],
    cards: [
      { type: "stat", icon: "heart", label: "Sodium Limit", value: "< 2,000mg", text: "Less than 1 teaspoon salt per day reduces systolic BP by 5-8 mmHg." },
      { type: "food", icon: "leaf", label: "Potassium Foods", text: "Spinach, bananas, and coconut water naturally lower pressure." },
      { type: "warn", icon: "alert", label: "Crisis Threshold", value: "180/120", text: "Seek emergency evaluation if BP exceeds this with symptoms." },
    ],
  },
  {
    id: "pcos_management",
    title: "PCOS / PCOD Lifestyle & Nutrition",
    category: "Endocrinology / Gynecology",
    keywords: ["pcos", "pcod", "irregular periods", "hormonal imbalance", "ovarian cysts", "facial hair"],
    overview: "Polycystic Ovary Syndrome (PCOS) is a multi-factorial endocrine condition involving insulin resistance, elevated androgens, and ovulatory dysfunction.",
    symptoms: ["Irregular or absent menstrual cycles", "Excess facial/body hair (hirsutism)", "Persistent cystic acne", "Weight gain around abdomen"],
    remedies: [
      "Prioritize resistance training (weight lifting / bodyweight) 3x weekly to improve muscular insulin sensitivity.",
      "Maintain consistent sleep hygiene (7-8 hours nightly) to regulate cortisol levels.",
      "Consider inositol and spearmint tea for natural androgen regulation.",
    ],
    dietaryTips: [
      "Low-glycemic index foods: pair carbohydrates with healthy fats and proteins.",
      "Incorporate anti-inflammatory spices: turmeric, cinnamon, and ginger.",
    ],
    whenToSeeDoctor: [
      "No menstrual period for more than 3 consecutive months",
      "Severe pelvic pain or sudden heavy bleeding",
    ],
    cards: [
      { type: "tip", icon: "activity", label: "Strength Training", text: "Weight training 3x/week improves insulin sensitivity by 30%." },
      { type: "remedy", icon: "leaf", label: "Spearmint Tea", text: "2 cups daily has anti-androgenic effects for hirsutism." },
      { type: "food", icon: "utensils", label: "Low Glycemic", text: "Combine carbs with proteins and healthy fats." },
    ],
  },
  {
    id: "ankle_sprain",
    title: "Ankle Sprain & Ligament Injury Care",
    category: "Orthopedics",
    keywords: ["twisted ankle", "sprain", "swollen ankle", "ligament tear", "ankle pain", "sprained"],
    overview: "An ankle sprain occurs when the supporting ligaments are stretched or torn, most commonly the anterior talofibular ligament during an inversion injury.",
    symptoms: ["Swelling and localized bruising", "Tenderness on outer ankle bone", "Pain with bearing weight", "Reduced range of motion"],
    remedies: [
      "Rest: Limit walking and weight-bearing on the injured foot for 48 hours.",
      "Ice: Apply cold pack wrapped in a cloth for 15-20 minutes, 3-4 times daily.",
      "Compression: Wrap with an elastic crepe bandage from toes towards mid-calf.",
      "Elevation: Elevate ankle above heart level on pillows while sitting or lying.",
    ],
    dietaryTips: [
      "Stay hydrated and consume protein-rich meals to support collagen remodeling.",
    ],
    whenToSeeDoctor: [
      "Inability to take 4 steps immediately after injury and in the clinic (Ottawa Ankle Rules)",
      "Direct bony tenderness over the malleolar tips (requires X-ray to rule out fracture)",
      "Severe numbness or tingling in the toes",
    ],
    cards: [
      { type: "tip", icon: "shield", label: "R.I.C.E.", text: "Rest, Ice (20m), Compression, Elevation above heart." },
      { type: "warn", icon: "alert", label: "Ottawa Rules", text: "Cannot bear 4 steps? Get an X-ray to rule out fracture." },
    ],
  },
  {
    id: "dehydration_ors",
    title: "Dehydration Prevention & WHO ORS Formula",
    category: "General Health",
    keywords: ["dehydration", "ors", "electrolyte", "dry mouth", "low urine", "dizziness heat"],
    overview: "Dehydration occurs when fluid loss exceeds intake. It can rapidly become life-threatening in infants, young children, and the elderly during acute gastroenteritis or heat exposure.",
    symptoms: ["Dry mouth and sticky saliva", "Dark amber or low urine output", "Sunken eyes", "Postural dizziness when standing"],
    remedies: [
      "Standard WHO ORS: Dissolve 1 sachet in exactly 1 Liter of clean drinking water.",
      "Emergency Home ORS Recipe: 1 liter boiled/clean water + 6 level teaspoons sugar + 1/2 level teaspoon salt.",
      "Sip small amounts frequently (50-100ml every 15 minutes) rather than gulping large quantities.",
    ],
    dietaryTips: [
      "Tender coconut water, clear vegetable broths, and salted buttermilk (chaas) are excellent natural electrolyte sources.",
      "Avoid undiluted sugary juices or caffeinated drinks which worsen diarrhea.",
    ],
    whenToSeeDoctor: [
      "No urination for over 8 hours (or no wet diapers in 6 hours for infants)",
      "Extreme lethargy, confusion, or sunken fontanelle in baby",
      "Persistent vomiting preventing any fluid retention",
    ],
    cards: [
      { type: "stat", icon: "droplet", label: "Home ORS Ratio", value: "6 Sugar : 0.5 Salt", text: "In 1 Liter clean water for emergency electrolyte hydration." },
      { type: "tip", icon: "check", label: "Small Frequent Sips", text: "Drink 50ml every 15 minutes to avoid triggering nausea." },
    ],
  },
];
