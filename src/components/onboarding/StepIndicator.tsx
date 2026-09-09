import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, typography } from "@/theme/tokens";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {stepLabels.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <View key={label} style={styles.stepWrapper}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isCompleted && styles.circleCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    isActive && styles.circleTextActive,
                    isCompleted && styles.circleTextCompleted,
                  ]}
                >
                  {isCompleted ? "✓" : index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isCompleted && styles.labelCompleted,
                ]}
              >
                {label}
              </Text>
            </View>

            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  circleCompleted: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  circleText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  circleTextActive: {
    color: colors.surface,
  },
  circleTextCompleted: {
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  labelCompleted: {
    color: colors.textSecondary,
  },
  connector: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.sm,
  },
  connectorCompleted: {
    backgroundColor: colors.textPrimary,
  },
});
