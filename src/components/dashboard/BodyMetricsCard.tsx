import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { ChevronRight } from "lucide-react-native";

interface BodyMetricsCardProps {
  heightCm: number;
  weightKg: number;
  bmiFormatted?: string;
  healthIssues?: string;
  onPress: () => void;
}

export function BodyMetricsCard({
  heightCm,
  weightKg,
  bmiFormatted,
  healthIssues,
  onPress,
}: BodyMetricsCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>Body Measurements</Text>
      <View style={styles.groupedCard}>
        <Pressable
          style={styles.cardHeaderAction}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="View and edit profile metrics"
        >
          <View style={styles.metricsGrid}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>Height</Text>
              <Text style={styles.metricValue}>{heightCm} cm</Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>{weightKg} kg</Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={styles.metricValue}>{bmiFormatted || "--"}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

        {healthIssues ? (
          <>
            <View style={styles.rowDivider} />
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Known Conditions</Text>
              <Text style={styles.conditionValue}>{healthIssues}</Text>
            </View>
          </>
        ) : null}
      </View>
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
  cardHeaderAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    minHeight: accessibility.minTouchTarget,
  },
  metricsGrid: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  metricValue: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  conditionRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  conditionLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  conditionValue: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
