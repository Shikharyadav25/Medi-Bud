import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useTranslation } from "@/locales";

interface HealthConditionsCardProps {
  weightKg: string;
  medications: string;
  allergies: string;
  savedMessage: boolean;
  onWeightChange: (val: string) => void;
  onMedicationsChange: (val: string) => void;
  onAllergiesChange: (val: string) => void;
  onSave: () => void;
}

export function HealthConditionsCard({
  weightKg,
  medications,
  allergies,
  savedMessage,
  onWeightChange,
  onMedicationsChange,
  onAllergiesChange,
  onSave,
}: HealthConditionsCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{t.profile.conditions}</Text>

      <View style={styles.groupedCard}>
        <View style={styles.inputRow}>
          <Text style={styles.rowLabel}>{t.profile.weight}</Text>
          <TextInput
            style={styles.textInputRight}
            keyboardType="numeric"
            value={weightKg}
            onChangeText={onWeightChange}
            maxLength={3}
            accessibilityLabel="Weight in kilograms"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputBlock}>
          <Text style={styles.blockLabel}>{t.profile.medications}</Text>
          <TextInput
            style={styles.textArea}
            value={medications}
            onChangeText={onMedicationsChange}
            multiline
            accessibilityLabel="Current medications list"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputBlock}>
          <Text style={styles.blockLabel}>{t.profile.allergies}</Text>
          <TextInput
            style={styles.textArea}
            value={allergies}
            onChangeText={onAllergiesChange}
            multiline
            accessibilityLabel="Known allergies list"
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="Save profile changes"
      >
        <Text style={styles.saveButtonText}>
          {savedMessage ? t.common.saved : t.common.save}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
  },
  inputRow: {
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  saveButton: {
    minHeight: 50,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
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
