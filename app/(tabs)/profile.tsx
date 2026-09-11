import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { calculateBMI } from "@/lib/bmi";
import { useTranslation } from "@/locales";
import { DemographicsCard } from "@/components/profile/DemographicsCard";
import { FamilyMembersCard } from "@/components/profile/FamilyMembersCard";
import { HealthConditionsCard } from "@/components/profile/HealthConditionsCard";
import { AppSettingsCard } from "@/components/profile/AppSettingsCard";
import { EmergencyContactModal } from "@/components/profile/EmergencyContactModal";
import { AddFamilyMemberModal } from "@/components/profile/AddFamilyMemberModal";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profiles,
    activeProfile,
    activeProfileId,
    loadProfiles,
    setActiveProfile,
    saveProfile,
  } = useProfileStore();
  const { loadSettings } = useSettingsStore();
  const { t } = useTranslation();

  const [weightKg, setWeightKg] = useState(activeProfile ? String(activeProfile.weightKg) : "70");
  const [medications, setMedications] = useState(activeProfile?.medications || "");
  const [allergies, setAllergies] = useState(activeProfile?.allergies || "");
  const [savedMessage, setSavedMessage] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    loadProfiles();
    loadSettings();
  }, [loadProfiles, loadSettings]);

  useEffect(() => {
    if (activeProfile) {
      setWeightKg(String(activeProfile.weightKg));
      setMedications(activeProfile.medications || "");
      setAllergies(activeProfile.allergies || "");
    }
  }, [activeProfile]);

  const bmiResult = activeProfile
    ? calculateBMI(activeProfile.heightCm, parseFloat(weightKg) || activeProfile.weightKg)
    : null;

  const handleUpdate = async () => {
    if (!activeProfile) return;
    await saveProfile({
      ...activeProfile,
      weightKg: parseFloat(weightKg) || activeProfile.weightKg,
      medications: medications.trim(),
      allergies: allergies.trim(),
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Large Title Header */}
        <View style={styles.header}>
          <Text style={styles.largeTitle}>{t.profile.title}</Text>
          <Text style={styles.subheadline}>{t.profile.subtitle}</Text>
        </View>

        {/* Family Profiles Multi-Profile Card */}
        <FamilyMembersCard
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelect={setActiveProfile}
          onAdd={() => setShowAddMember(true)}
        />

        {/* Demographics Summary Card */}
        <DemographicsCard
          age={activeProfile?.age}
          gender={activeProfile?.gender}
          heightCm={activeProfile?.heightCm}
          bmiFormatted={bmiResult?.formatted}
          bmiCategory={bmiResult?.category}
          onEditFullProfile={() => router.push("/onboarding")}
        />

        {/* Editable Health Metrics & Conditions */}
        <HealthConditionsCard
          weightKg={weightKg}
          medications={medications}
          allergies={allergies}
          savedMessage={savedMessage}
          onWeightChange={setWeightKg}
          onMedicationsChange={setMedications}
          onAllergiesChange={setAllergies}
          onSave={handleUpdate}
        />

        {/* Application Preferences & Settings */}
        <AppSettingsCard
          onEditEmergencyContact={() => setShowEmergencyModal(true)}
        />

        {/* Modals */}
        <AddFamilyMemberModal
          visible={showAddMember}
          onClose={() => setShowAddMember(false)}
        />

        <EmergencyContactModal
          visible={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    maxWidth: 540,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: spacing.xl,
  },
  largeTitle: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  subheadline: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
