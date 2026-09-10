import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { calculateBMI } from "@/lib/bmi";
import { DemographicsCard } from "@/components/profile/DemographicsCard";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loadProfile, saveProfile, syncStatus } = useProfileStore();

  const [weightKg, setWeightKg] = useState(profile ? String(profile.weightKg) : "70");
  const [medications, setMedications] = useState(profile?.medications || "");
  const [allergies, setAllergies] = useState(profile?.allergies || "");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (!profile) {
      loadProfile("local_user_default");
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    if (profile) {
      setWeightKg(String(profile.weightKg));
      setMedications(profile.medications || "");
      setAllergies(profile.allergies || "");
    }
  }, [profile]);

  const bmiResult = profile
    ? calculateBMI(profile.heightCm, parseFloat(weightKg) || profile.weightKg)
    : null;

  const handleUpdate = async () => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      weightKg: parseFloat(weightKg) || profile.weightKg,
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
          <Text style={styles.largeTitle}>Health Details</Text>
          <Text style={styles.subheadline}>
            Profile data is used across offline triage and medication interactions.
          </Text>
        </View>

        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Synchronization</Text>
          <View style={styles.groupedCard}>
            <View style={styles.syncRow}>
              <Text style={styles.rowLabel}>Cloud Backup</Text>
              <View
                style={[
                  styles.syncBadge,
                  syncStatus === "synced" ? styles.syncOk : styles.syncPending,
                ]}
              >
                <Text
                  style={[
                    styles.syncBadgeText,
                    syncStatus === "synced" ? styles.syncOkText : styles.syncPendingText,
                  ]}
                >
                  {syncStatus === "synced" ? "Synced" : "Queued in SQLite"}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionFooter}>
            All edits save locally first and sync automatically when internet connectivity returns.
          </Text>
        </View>

        {/* Demographics Section */}
        <DemographicsCard
          age={profile?.age}
          gender={profile?.gender}
          heightCm={profile?.heightCm}
          bmiFormatted={bmiResult?.formatted}
          bmiCategory={bmiResult?.category}
          onEditFullProfile={() => router.push("/onboarding")}
        />

        {/* Editable Health Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Update Conditions & Meds</Text>
          <View style={styles.groupedCard}>
            <View style={styles.inputRow}>
              <Text style={styles.rowLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInputRight}
                keyboardType="numeric"
                value={weightKg}
                onChangeText={setWeightKg}
                maxLength={3}
                accessibilityLabel="Weight in kilograms"
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.inputBlock}>
              <Text style={styles.blockLabel}>Medications</Text>
              <TextInput
                style={styles.textArea}
                value={medications}
                onChangeText={setMedications}
                multiline
                accessibilityLabel="Current medications list"
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.inputBlock}>
              <Text style={styles.blockLabel}>Allergies</Text>
              <TextInput
                style={styles.textArea}
                value={allergies}
                onChangeText={setAllergies}
                multiline
                accessibilityLabel="Known allergies list"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleUpdate}
          accessibilityRole="button"
          accessibilityLabel="Save updated profile changes to local SQLite"
        >
          <Text style={styles.saveButtonText}>
            {savedMessage ? "Saved to SQLite ✓" : "Save Changes"}
          </Text>
        </Pressable>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionFooter: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    lineHeight: 18,
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    minHeight: accessibility.minTouchTarget + 4,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    minHeight: accessibility.minTouchTarget + 4,
  },
  textInputRight: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "right",
    paddingVertical: spacing.md,
    minWidth: 50,
  },
  inputBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  blockLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  textArea: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  syncBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  syncOk: {
    backgroundColor: colors.selfCare.bg,
    borderColor: colors.selfCare.border,
  },
  syncPending: {
    backgroundColor: colors.soon.bg,
    borderColor: colors.soon.border,
  },
  syncBadgeText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  syncOkText: {
    color: colors.selfCare.text,
  },
  syncPendingText: {
    color: colors.soon.text,
  },
  saveButton: {
    minHeight: 52,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
