import { UserProfile } from "@/lib/types";

export interface PediatricSafetyGuidance {
  isRestricted: boolean;
  title: string;
  reason: string;
  keyPrecautions: string[];
  recommendedAction: string;
}

export function isPediatricProfile(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.age < 18 || profile.relationship === "child";
}

export function getPediatricSafetyGuidance(
  profile: UserProfile | null,
  language: "en" | "hi" = "en"
): PediatricSafetyGuidance {
  const isPediatric = isPediatricProfile(profile);

  if (!isPediatric) {
    return {
      isRestricted: false,
      title: "",
      reason: "",
      keyPrecautions: [],
      recommendedAction: "",
    };
  }

  if (language === "hi") {
    return {
      isRestricted: true,
      title: "बाल सुरक्षा चेतावनी (Pediatric Safety)",
      reason:
        "बच्चों के महत्वपूर्ण संकेत (हृदय गति, श्वास दर), बुखार की सीमाएं और बीमारी का बढ़ना वयस्कों से बहुत भिन्न होता है। स्वचालित वयस्क ट्राइएज बच्चों के लिए सुरक्षित नहीं है।",
      keyPrecautions: [
        "वयस्कों की पेरासिटामोल या एंटीबायोटिक खुराक बच्चों को कभी न दें।",
        "यदि बच्चा लगातार सुस्त है, रोते हुए आंसू नहीं आ रहे हैं, या सांस तेजी से ले रहा है, तो तुरंत डॉक्टर को दिखाएं।",
        "बुखार को डिजिटल थर्मामीटर से सटीक मापें।",
      ],
      recommendedAction:
        "कृपया तुरंत किसी योग्य बाल रोग विशेषज्ञ (पीडियाट्रिशियन) से परामर्श लें अथवा आपातकालीन नंबर 112 पर कॉल करें।",
    };
  }

  return {
    isRestricted: true,
    title: "Pediatric Clinical Safety Alert",
    reason:
      "Vital sign baselines, febrile seizure risks, and symptom progressions in children differ fundamentally from adults. Automated adult triage rules cannot be safely applied to infants, children, or teenagers under 18.",
    keyPrecautions: [
      "Never administer adult over-the-counter dosages or aspirin to children.",
      "Seek emergency care immediately if the child exhibits extreme lethargy, rapid breathing, or dehydration (dry lips, no tears).",
      "Always measure temperature using a calibrated digital thermometer.",
    ],
    recommendedAction:
      "Please contact a certified pediatrician or visit the nearest pediatric urgent care facility immediately.",
  };
}
