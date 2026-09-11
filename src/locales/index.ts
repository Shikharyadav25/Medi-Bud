import { en, TranslationSchema } from "./en";
import { hi } from "./hi";
import { useSettingsStore } from "@/store/useSettingsStore";

export * from "./en";
export * from "./hi";

export function getTranslation(language: "en" | "hi"): TranslationSchema {
  return language === "hi" ? hi : en;
}

export function useTranslation(): { t: TranslationSchema; language: "en" | "hi" } {
  const language = useSettingsStore((state) => state.language);
  const t = getTranslation(language);
  return { t, language };
}
