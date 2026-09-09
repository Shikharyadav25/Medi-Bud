import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { calculateBMI } from "@/lib/bmi";

interface BodyStepProps {
  heightCm: string;
  weightKg: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function BodyStep({
  heightCm,
  weightKg,
  onHeightChange,
  onWeightChange,
  onBack,
  onNext,
}: BodyStepProps) {
  const heightNum = parseFloat(heightCm) || 0;
  const weightNum = parseFloat(weightKg) || 0;
  const bmiResult = calculateBMI(heightNum, weightNum);

  const isValid = heightNum >= 50 && weightNum >= 20;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Body Metrics</Text>
          <Text style={styles.subtitle}>
            Height and weight determine your BMI, used to adjust diet plans and identify health risks.
          </Text>
        </View>

        {/* Inset Grouped Table */}
        <View style={styles.groupedCard}>
          <View style={styles.inputRow}>
            <Text style={styles.rowLabel}>Height</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                returnKeyType="done"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={heightCm}
                onChangeText={onHeightChange}
                onSubmitEditing={Keyboard.dismiss}
                maxLength={3}
                accessibilityLabel="Height in centimeters"
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.inputRow}>
            <Text style={styles.rowLabel}>Weight</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                returnKeyType="done"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={weightKg}
                onChangeText={onWeightChange}
                onSubmitEditing={Keyboard.dismiss}
                maxLength={3}
                accessibilityLabel="Weight in kilograms"
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
          </View>
        </View>

        {/* Apple Health Style BMI Card */}
        {bmiResult && (
          <View style={styles.bmiCard}>
            <View style={styles.bmiTopRow}>
              <Text style={styles.bmiCardTitle}>Calculated BMI</Text>
              <View
                style={[
                  styles.categoryPill,
                  bmiResult.isNormal ? styles.pillNormal : styles.pillWarning,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    bmiResult.isNormal ? styles.pillNormalText : styles.pillWarningText,
                  ]}
                >
                  {bmiResult.category}
                </Text>
              </View>
            </View>
            <Text style={styles.bmiMetric}>{bmiResult.formatted}</Text>
            <Text style={styles.bmiFootnote}>
              {bmiResult.isNormal
                ? "Your BMI is within the standard healthy range (18.5 – 24.9)."
                : `Classified as ${bmiResult.category.toLowerCase()}. Useful for dietary planning.`}
            </Text>
          </View>
        )}

        {/* Button Row */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              Keyboard.dismiss();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Back to Personal Details"
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <Pressable
            style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
            disabled={!isValid}
            onPress={() => {
              Keyboard.dismiss();
              onNext();
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue to Health Conditions"
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.huge,
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
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    minHeight: accessibility.minTouchTarget + 6,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "right",
    paddingVertical: spacing.md,
    minWidth: 40,
  },
  unitText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  bmiCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  bmiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bmiCardTitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pillNormal: {
    backgroundColor: colors.selfCare.bg,
    borderColor: colors.selfCare.border,
  },
  pillWarning: {
    backgroundColor: colors.soon.bg,
    borderColor: colors.soon.border,
  },
  categoryText: {
    ...typography.caption2,
    fontWeight: "700",
  },
  pillNormalText: {
    color: colors.selfCare.text,
  },
  pillWarningText: {
    color: colors.soon.text,
  },
  bmiMetric: {
    ...typography.title1,
    fontSize: 32,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  bmiFootnote: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
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
  nextButton: {
    flex: 2,
    minHeight: 52,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.35,
  },
  nextButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
