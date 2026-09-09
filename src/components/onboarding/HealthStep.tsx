import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";

interface HealthStepProps {
  healthIssues: string;
  medications: string;
  allergies: string;
  isSaving: boolean;
  onHealthIssuesChange: (value: string) => void;
  onMedicationsChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const COMMON_CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "PCOS",
  "Thyroid",
  "Asthma",
  "None",
];

export function HealthStep({
  healthIssues,
  medications,
  allergies,
  isSaving,
  onHealthIssuesChange,
  onMedicationsChange,
  onAllergiesChange,
  onBack,
  onSubmit,
}: HealthStepProps) {
  const toggleCondition = (cond: string) => {
    if (cond === "None") {
      onHealthIssuesChange("None");
      return;
    }

    const currentList = healthIssues
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== "None");

    if (currentList.includes(cond)) {
      onHealthIssuesChange(currentList.filter((c) => c !== cond).join(", "));
    } else {
      onHealthIssuesChange([...currentList, cond].join(", "));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Profile</Text>
        <Text style={styles.subtitle}>
          Stored securely in local SQLite. Used to prevent dangerous drug/food interactions.
        </Text>
      </View>

      {/* Conditions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Common Conditions</Text>
        <View style={styles.chipsContainer}>
          {COMMON_CONDITIONS.map((cond) => {
            const isSelected = healthIssues.includes(cond);
            return (
              <Pressable
                key={cond}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleCondition(cond)}
                accessibilityRole="button"
                accessibilityLabel={`Condition: ${cond}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cond}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Grouped Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Medical Details</Text>
        <View style={styles.groupedCard}>
          <View style={styles.inputBlock}>
            <Text style={styles.blockLabel}>Other Conditions</Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="e.g. Acid Reflux, Migraines..."
              placeholderTextColor={colors.textMuted}
              value={healthIssues}
              onChangeText={onHealthIssuesChange}
              multiline
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.inputBlock}>
            <Text style={styles.blockLabel}>Current Medications</Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="e.g. Metformin 500mg, Telmisartan 40mg..."
              placeholderTextColor={colors.textMuted}
              value={medications}
              onChangeText={onMedicationsChange}
              multiline
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.inputBlock}>
            <Text style={styles.blockLabel}>Allergies</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Penicillin, Peanuts, Sulfa..."
              placeholderTextColor={colors.textMuted}
              value={allergies}
              onChangeText={onAllergiesChange}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.backButton} onPress={onBack} accessibilityRole="button">
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Pressable
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          disabled={isSaving}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Complete Health Setup"
        >
          <Text style={styles.submitButtonText}>
            {isSaving ? "Saving Locally..." : "Complete Setup"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.xl },
  title: { ...typography.title1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.subheadline, color: colors.textSecondary, lineHeight: 20 },
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: accessibility.minTouchTarget, // 44pt Apple minimum touch target
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    ...typography.subheadline,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
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
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  textInputArea: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: "top",
    paddingVertical: spacing.xs,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.huge,
    marginTop: spacing.sm,
  },
  backButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    minHeight: 52,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
