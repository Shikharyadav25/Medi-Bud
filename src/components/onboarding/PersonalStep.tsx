import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";

interface PersonalStepProps {
  age: string;
  gender: string;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onNext: () => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export function PersonalStep({
  age,
  gender,
  onAgeChange,
  onGenderChange,
  onNext,
}: PersonalStepProps) {
  const isValid = age.trim().length > 0 && parseInt(age, 10) > 0 && gender.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>
          Your age and biological sex calibrate vital baselines, dosage safety, and triage rules.
        </Text>
      </View>

      {/* Inset Grouped Section for Personal Details */}
      <View style={styles.groupedCard}>
        <View style={styles.inputRow}>
          <Text style={styles.rowLabel}>Age</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="number-pad"
            placeholder="Required"
            placeholderTextColor={colors.textMuted}
            value={age}
            onChangeText={onAgeChange}
            maxLength={3}
            accessibilityLabel="Age in years"
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.segmentRow}>
          <Text style={styles.rowLabel}>Sex</Text>
          <View style={styles.segmentContainer}>
            {GENDER_OPTIONS.map((option) => {
              const isSelected = gender === option;
              return (
                <Pressable
                  key={option}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonSelected,
                  ]}
                  onPress={() => onGenderChange(option)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Pinned Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          !isValid && styles.continueButtonDisabled,
          pressed && isValid && styles.buttonPressed,
        ]}
        disabled={!isValid}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Continue to Body Metrics"
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subheadline,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    minHeight: accessibility.minTouchTarget + 6, // 50pt
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "right",
    flex: 1,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: accessibility.minTouchTarget + 6,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: 3,
  },
  segmentButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentButtonSelected: {
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  segmentTextSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  continueButton: {
    minHeight: 52,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
