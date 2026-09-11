import { Linking } from "react-native";
import { EmergencyContact } from "@/lib/types";

export const NATIONAL_EMERGENCY_NUMBER = "112";
export const AMBULANCE_NUMBER = "102";

export async function dialEmergencyNumber(phoneNumber: string): Promise<boolean> {
  const sanitized = phoneNumber.replace(/[^\d+]/g, "");
  if (!sanitized) return false;

  const url = `tel:${sanitized}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    // Attempt fallback direct opening
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.warn("Failed to initiate phone dialer:", err);
    return false;
  }
}

export async function callNationalEmergency(): Promise<boolean> {
  return dialEmergencyNumber(NATIONAL_EMERGENCY_NUMBER);
}

export async function callAmbulance(): Promise<boolean> {
  return dialEmergencyNumber(AMBULANCE_NUMBER);
}

export async function callFamilyContact(
  contact: EmergencyContact | null
): Promise<boolean> {
  if (!contact || !contact.phone) return false;
  return dialEmergencyNumber(contact.phone);
}
