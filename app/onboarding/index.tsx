import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/theme/tokens";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { PersonalStep } from "@/components/onboarding/PersonalStep";
import { BodyStep } from "@/components/onboarding/BodyStep";
import { HealthStep } from "@/components/onboarding/HealthStep";
import { useProfileStore } from "@/store/useProfileStore";

const STEP_LABELS = ["Personal", "Metrics", "Health"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, loadProfile, saveProfile } = useProfileStore();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized with any existing profile data
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile?.weightKg ? String(profile.weightKg) : "");
  const [healthIssues, setHealthIssues] = useState(profile?.healthIssues || "");
  const [medications, setMedications] = useState(profile?.medications || "");
  const [allergies, setAllergies] = useState(profile?.allergies || "");

  useEffect(() => {
    if (!profile) {
      loadProfile("local_user_default");
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    if (profile) {
      if (!age && profile.age) setAge(String(profile.age));
      if (!gender && profile.gender) setGender(profile.gender);
      if (!heightCm && profile.heightCm) setHeightCm(String(profile.heightCm));
      if (!weightKg && profile.weightKg) setWeightKg(String(profile.weightKg));
      if (!healthIssues && profile.healthIssues) setHealthIssues(profile.healthIssues);
      if (!medications && profile.medications) setMedications(profile.medications);
      if (!allergies && profile.allergies) setAllergies(profile.allergies);
    }
  }, [profile]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const guestUid = "local_user_default";
      await saveProfile({
        uid: guestUid,
        accountId: "local_account_default",
        name: "Primary (Self)",
        relationship: "self",
        age: parseInt(age, 10) || 30,
        gender: gender || "Other",
        heightCm: parseFloat(heightCm) || 170,
        weightKg: parseFloat(weightKg) || 70,
        healthIssues: healthIssues.trim(),
        medications: medications.trim(),
        allergies: allergies.trim(),
      });

      // Navigate to tabs
      router.replace("/(tabs)");
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.container}>
          <StepIndicator
            currentStep={step}
            totalSteps={STEP_LABELS.length}
            stepLabels={STEP_LABELS}
          />

          {step === 0 && (
            <PersonalStep
              age={age}
              gender={gender}
              onAgeChange={setAge}
              onGenderChange={setGender}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <BodyStep
              heightCm={heightCm}
              weightKg={weightKg}
              onHeightChange={setHeightCm}
              onWeightChange={setWeightKg}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <HealthStep
              healthIssues={healthIssues}
              medications={medications}
              allergies={allergies}
              isSaving={isSaving}
              onHealthIssuesChange={setHealthIssues}
              onMedicationsChange={setMedications}
              onAllergiesChange={setAllergies}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
});
