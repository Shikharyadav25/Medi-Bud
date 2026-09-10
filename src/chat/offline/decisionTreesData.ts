import { DecisionTree } from "../types";

export const DECISION_TREES: Record<string, DecisionTree> = {
  chest_pain: {
    id: "chest_pain",
    title: "Chest Pain Diagnostic Tree",
    triggerKeywords: ["chest pain", "chest tightness", "chest pressure", "heart pain", "triage chest", "chhati me dard", "sine me dard", "seene me dard", "dil me dard"],
    rootNodeId: "cp_root",
    nodes: {
      cp_root: {
        id: "cp_root",
        question: "Are you experiencing crushing chest pressure, pain radiating to your left arm or jaw, cold sweats, or severe shortness of breath?",
        options: [
          { label: "Yes, sudden pressure or radiating pain", nextNodeId: "cp_emergency" },
          { label: "No, pain is sharp or related to movement", nextNodeId: "cp_movement" },
        ],
      },
      cp_movement: {
        id: "cp_movement",
        question: "Does the pain get significantly worse when you press on your ribcage or take a deep breath?",
        options: [
          { label: "Yes, tender to the touch on chest wall", nextNodeId: "cp_musculoskeletal" },
          { label: "No, feels like burning after eating", nextNodeId: "cp_acid" },
          { label: "Neither, vague intermittent discomfort", nextNodeId: "cp_soon" },
        ],
      },
      cp_emergency: {
        id: "cp_emergency",
        question: "Emergency Evaluation",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 Call 112 / 911 immediately. These symptoms indicate potential myocardial ischemia (heart attack). Sit down, loosen tight clothing, chew 300mg aspirin if not allergic, and wait for emergency paramedics.",
        cards: [
          { type: "warn", icon: "heart", label: "Call 112/911", value: "Emergency", text: "Suspected cardiac event requires immediate hospital ECG." },
          { type: "med", icon: "pill", label: "Aspirin 300mg", text: "Chew non-enteric aspirin if available and not contraindicated." },
        ],
      },
      cp_musculoskeletal: {
        id: "cp_musculoskeletal",
        question: "Musculoskeletal Chest Wall Strain",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Localized chest wall tenderness that worsens with pressure or breathing is often costochondritis or muscle strain. Apply warm compress, avoid strenuous lifting, and consider paracetamol. If shortness of breath develops, seek immediate care.",
        cards: [
          { type: "tip", icon: "shield", label: "Rest & Warmth", text: "Avoid heavy lifting; apply warm compresses to the area." },
          { type: "remedy", icon: "leaf", label: "Relief", text: "Paracetamol or ibuprofen as appropriate." },
        ],
      },
      cp_acid: {
        id: "cp_acid",
        question: "Gastroesophageal Reflux (Heartburn)",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Burning discomfort centered behind the breastbone that flares after eating or lying flat suggests acid reflux. Take an antacid, stay upright for 2 hours after eating, and drink warm water. Note: Heart attacks can mimic heartburn; seek ER care if pain radiates or causes sweating.",
        cards: [
          { type: "tip", icon: "utensils", label: "Stay Upright", text: "Avoid lying down for 2-3 hours after meals." },
          { type: "med", icon: "pill", label: "Antacid", text: "Gelusil, Digene, or liquid antacid for quick relief." },
        ],
      },
      cp_soon: {
        id: "cp_soon",
        question: "Unexplained Chest Discomfort",
        isTerminal: true,
        urgency: "soon",
        recommendation: "Unexplained chest discomfort should never be ignored. Schedule an appointment with a physician or clinic today for an ECG and physical examination.",
        cards: [
          { type: "warn", icon: "alert", label: "See Doctor Soon", text: "Get an ECG to rule out underlying cardiovascular or pulmonary causes." },
        ],
      },
    },
  },

  fever: {
    id: "fever",
    title: "Fever & Infection Triage",
    triggerKeywords: ["fever", "high temperature", "chills", "feeling hot", "triage fever", "bukhar", "tez bukhar", "thand lagna", "shishu bukhar"],
    rootNodeId: "fever_root",
    nodes: {
      fever_root: {
        id: "fever_root",
        question: "Who has the fever, and what is their approximate age?",
        options: [
          { label: "Infant under 3 months", nextNodeId: "fever_infant" },
          { label: "Young child (3 months – 5 years)", nextNodeId: "fever_child" },
          { label: "Older child or adult", nextNodeId: "fever_adult" },
        ],
      },
      fever_infant: {
        id: "fever_infant",
        question: "Infant Fever Assessment",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 Any temperature ≥ 100.4°F (38°C) in an infant under 3 months is a medical emergency. Young babies lack mature immune defenses against serious bacterial infections. Go to the nearest Pediatric Emergency Department immediately.",
        cards: [
          { type: "warn", icon: "thermometer", label: "Pediatric Emergency", value: "≥ 100.4°F", text: "Must be seen by a doctor immediately." },
          { type: "avoid", icon: "x", label: "No Meds First", text: "Do not give antipyretics without doctor assessment." },
        ],
      },
      fever_child: {
        id: "fever_child",
        question: "Is the child lethargic, struggling to breathe, complaining of stiff neck, or showing a non-blanching dark purple rash?",
        options: [
          { label: "Yes, lethargic or has purple rash", nextNodeId: "fever_child_er" },
          { label: "No, drinks fluids and plays when temp drops", nextNodeId: "fever_child_home" },
        ],
      },
      fever_child_er: {
        id: "fever_child_er",
        question: "Pediatric Urgent Care Required",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 Lethargy, stiff neck, respiratory distress, or petechial (purple) rash are red flags for severe infection like meningitis or pneumonia. Take the child to the Emergency Room right away.",
        cards: [
          { type: "warn", icon: "alert", label: "Seek Immediate Care", text: "Do not wait; hospital evaluation is urgent." },
        ],
      },
      fever_child_home: {
        id: "fever_child_home",
        question: "Pediatric Home Care Protocol",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "If child is alert and drinking fluids: Maintain hydration with small frequent sips of water or electrolyte solution. Use paracetamol suspension dosed strictly by weight. Dress lightly. See a doctor if fever lasts > 3 days or exceeds 104°F (40°C).",
        cards: [
          { type: "tip", icon: "droplet", label: "Hydration", text: "Frequent sips of water, milk, or electrolyte fluid." },
          { type: "med", icon: "pill", label: "Paracetamol", text: "Dose by child's weight, not age." },
        ],
      },
      fever_adult: {
        id: "fever_adult",
        question: "How long has the fever been present, and do you have severe symptoms (stiff neck, confusion, coughing blood)?",
        options: [
          { label: "Severe symptoms present", nextNodeId: "fever_adult_er" },
          { label: "Fever > 3 days without improvement", nextNodeId: "fever_adult_soon" },
          { label: "Under 3 days, mild cold/flu symptoms", nextNodeId: "fever_adult_home" },
        ],
      },
      fever_adult_er: {
        id: "fever_adult_er",
        question: "Adult Severe Infection Warning",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 Fever combined with stiff neck, confusion, shortness of breath, or coughing blood requires immediate hospital emergency room evaluation.",
        cards: [
          { type: "warn", icon: "alert", label: "Hospital ER", text: "Emergency assessment needed for invasive infection." },
        ],
      },
      fever_adult_soon: {
        id: "fever_adult_soon",
        question: "Persistent Fever (Blood Tests Recommended)",
        isTerminal: true,
        urgency: "soon",
        recommendation: "A fever lasting more than 72 hours requires physician evaluation and blood tests (CBC, Dengue/Malaria/Typhoid workup depending on local endemic risks). Schedule an appointment today.",
        cards: [
          { type: "stat", icon: "activity", label: "Duration", value: "> 3 Days", text: "Schedule doctor visit for blood screening." },
        ],
      },
      fever_adult_home: {
        id: "fever_adult_home",
        question: "Standard Viral Fever Care",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Rest abundantly and drink at least 2.5–3 liters of fluids daily (water, coconut water, warm broth). Take paracetamol 500-650mg every 6 hours as needed for comfort. Monitor temperature twice daily.",
        cards: [
          { type: "tip", icon: "droplet", label: "Fluids", value: "2.5-3 Liters", text: "Oral rehydration, coconut water, herbal teas." },
          { type: "med", icon: "pill", label: "Paracetamol 650mg", text: "Every 6-8 hrs as needed for temperature relief." },
        ],
      },
    },
  },

  headache: {
    id: "headache",
    title: "Headache Evaluation Flow",
    triggerKeywords: ["headache", "migraine", "head pain", "throbbing head", "triage headache", "sir dard", "sar dard", "sir me dard", "migraine ka dard"],
    rootNodeId: "ha_root",
    nodes: {
      ha_root: {
        id: "ha_root",
        question: "Did this headache come on suddenly like a 'thunderclap' (reaching maximum 10/10 severity within 60 seconds), or is it accompanied by fever and stiff neck?",
        options: [
          { label: "Yes, sudden severe thunderclap", nextNodeId: "ha_thunderclap" },
          { label: "No, gradual or familiar headache", nextNodeId: "ha_pattern" },
        ],
      },
      ha_thunderclap: {
        id: "ha_thunderclap",
        question: "Thunderclap Headache Warning",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 A sudden explosive headache reaching peak intensity in seconds is a medical emergency (possible subarachnoid hemorrhage). Call 112 / 911 or proceed to the nearest ER immediately.",
        cards: [
          { type: "warn", icon: "alert", label: "Emergency", value: "Immediate ER", text: "Requires emergency brain CT scan to rule out bleed." },
        ],
      },
      ha_pattern: {
        id: "ha_pattern",
        question: "Which description best matches your headache?",
        options: [
          { label: "One-sided, throbbing, nausea, light sensitivity", nextNodeId: "ha_migraine" },
          { label: "Dull pressure like a tight band around head", nextNodeId: "ha_tension" },
        ],
      },
      ha_migraine: {
        id: "ha_migraine",
        question: "Migraine Protocol",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Consistent with Migraine: Rest in a dark, quiet room with a cool compress on your forehead. Take your prescribed triptan or an NSAID (like naproxen or ibuprofen) early in the attack. Drink water to rule out dehydration.",
        cards: [
          { type: "tip", icon: "shield", label: "Dark Room", text: "Eliminate bright lights and screen glare." },
          { type: "remedy", icon: "droplet", label: "Hydration & Caffeine", text: "Cold water and a small cup of coffee can assist." },
        ],
      },
      ha_tension: {
        id: "ha_tension",
        question: "Tension-Type Headache Protocol",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Consistent with Tension Headache: Usually triggered by stress, eye strain, neck posture, or lack of sleep. Gently massage temples and neck muscles, take a 15-minute screen break, stay hydrated, and take paracetamol if needed.",
        cards: [
          { type: "tip", icon: "activity", label: "Stretch & Relax", text: "Gentle neck rolls and warm shower." },
          { type: "med", icon: "pill", label: "Paracetamol", text: "Over-the-counter pain relief as needed." },
        ],
      },
    },
  },

  abdominal_pain: {
    id: "abdominal_pain",
    title: "Abdominal Pain Triage",
    triggerKeywords: ["stomach pain", "abdominal pain", "belly pain", "stomach ache", "triage stomach", "pet dard", "pet me marod", "pet me jalan", "pet kharab"],
    rootNodeId: "ab_root",
    nodes: {
      ab_root: {
        id: "ab_root",
        question: "Is the pain severe and focused in the right lower abdomen, or are you vomiting blood, experiencing black tarry stools, or running a high fever?",
        options: [
          { label: "Yes, severe right lower side or vomiting blood", nextNodeId: "ab_er" },
          { label: "No, generalized cramping or upper burning", nextNodeId: "ab_type" },
        ],
      },
      ab_er: {
        id: "ab_er",
        question: "Acute Abdomen Warning",
        isTerminal: true,
        urgency: "emergency",
        recommendation: "🚨 Severe localized pain in the right lower abdomen (suspected appendicitis), abdominal rigidity, or gastrointestinal bleeding requires immediate hospital emergency department evaluation. Do NOT eat, drink, or take pain meds before examination.",
        cards: [
          { type: "warn", icon: "alert", label: "Appendicitis Alert", text: "Right lower quadrant pain requires surgical assessment." },
          { type: "avoid", icon: "x", label: "Nil by Mouth", text: "Do not eat or drink in case emergency surgery is needed." },
        ],
      },
      ab_type: {
        id: "ab_type",
        question: "What other symptoms are present?",
        options: [
          { label: "Watery diarrhea and nausea (stomach bug)", nextNodeId: "ab_gastro" },
          { label: "Burning upper stomach after spicy/heavy meal", nextNodeId: "ab_gastritis" },
        ],
      },
      ab_gastro: {
        id: "ab_gastro",
        question: "Acute Gastroenteritis Care",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Maintain oral hydration with Oral Rehydration Salts (ORS) or electrolyte solutions after every loose stool. Follow the BRAT diet (Bananas, Rice, Applesauce, Toast). Seek medical care if unable to keep fluids down for > 12 hours or if blood appears in stool.",
        cards: [
          { type: "tip", icon: "droplet", label: "ORS Solution", text: "Drink 1 glass of ORS after every loose stool." },
          { type: "food", icon: "utensils", label: "Bland Diet", text: "Plain white rice, curd/yogurt, boiled potatoes." },
        ],
      },
      ab_gastritis: {
        id: "ab_gastritis",
        question: "Gastritis & Acid Indigestion",
        isTerminal: true,
        urgency: "self_care",
        recommendation: "Upper stomach burning is commonly related to acute gastritis. Sip cold milk or take an antacid. Avoid acidic, fried, spicy food, coffee, and alcohol. If pain persists beyond 24 hours, see a doctor for H. pylori or ulcer check.",
        cards: [
          { type: "med", icon: "pill", label: "Antacid", text: "Liquid antacid (Gelusil/Digene) between meals." },
          { type: "avoid", icon: "x", label: "Avoid NSAIDs", text: "Do not take ibuprofen/aspirin which irritate stomach lining." },
        ],
      },
    },
  },
};
