import { Linking } from "react-native";
import {
  callNationalEmergency,
  callAmbulance,
  callFamilyContact,
  dialEmergencyNumber,
  NATIONAL_EMERGENCY_NUMBER,
  AMBULANCE_NUMBER,
} from "@/services/emergencyService";

jest.mock("react-native", () => ({
  Linking: {
    canOpenURL: jest.fn().mockResolvedValue(true),
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

describe("Emergency Dialer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("dials 112 for national emergency services", async () => {
    const success = await callNationalEmergency();
    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(`tel:${NATIONAL_EMERGENCY_NUMBER}`);
  });

  test("dials 102 for ambulance services", async () => {
    const success = await callAmbulance();
    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(`tel:${AMBULANCE_NUMBER}`);
  });

  test("dials family emergency contact with sanitized digits", async () => {
    const contact = {
      name: "Papa",
      phone: "+91 98765-43210",
      relationship: "parent",
    };

    const success = await callFamilyContact(contact);
    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith("tel:+919876543210");
  });

  test("returns false when family contact is missing or has no number", async () => {
    expect(await callFamilyContact(null)).toBe(false);
    expect(await callFamilyContact({ name: "Nobody", phone: "" })).toBe(false);
    expect(await dialEmergencyNumber("")).toBe(false);
  });
});
