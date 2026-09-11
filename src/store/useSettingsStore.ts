import { create } from "zustand";
import { AppSettings, EmergencyContact } from "@/lib/types";
import { fetchSettings, persistSetting } from "@/db/client";

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  loadSettings: () => void;
  setLanguage: (lang: "en" | "hi") => void;
  setLowDataMode: (enabled: boolean) => void;
  setLargerText: (enabled: boolean) => void;
  setEmergencyContact: (contact: EmergencyContact | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "en",
  lowDataMode: false,
  largerText: false,
  emergencyContact: null,
  isLoaded: false,

  loadSettings: () => {
    const settings = fetchSettings();
    set({
      language: settings.language,
      lowDataMode: settings.lowDataMode,
      largerText: settings.largerText,
      emergencyContact: settings.emergencyContact,
      isLoaded: true,
    });
  },

  setLanguage: (lang: "en" | "hi") => {
    persistSetting("language", lang);
    set({ language: lang });
  },

  setLowDataMode: (enabled: boolean) => {
    persistSetting("low_data_mode", String(enabled));
    set({ lowDataMode: enabled });
  },

  setLargerText: (enabled: boolean) => {
    persistSetting("larger_text", String(enabled));
    set({ largerText: enabled });
  },

  setEmergencyContact: (contact: EmergencyContact | null) => {
    persistSetting(
      "emergency_contact",
      contact ? JSON.stringify(contact) : ""
    );
    set({ emergencyContact: contact });
  },
}));
