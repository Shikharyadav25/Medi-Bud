import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";

interface DemographicsCardProps {
  age?: number;
  gender?: string;
  heightCm?: number;
  bmiFormatted?: string;
  bmiCategory?: string;
  onEditFullProfile?: () => void;
}

export function DemographicsCard({
  age,
  gender,
  heightCm,
  bmiFormatted,
  bmiCategory,
  onEditFullProfile,
}: DemographicsCardProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>Baseline Information</Text>
        {onEditFullProfile && (
          <Pressable
            onPress={onEditFullProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit full onboarding details"
            hitSlop={8}
          >
            <Text style={styles.editLink}>Edit All</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Age</Text>
          <Text style={styles.rowValue}>{age ?? "--"} years</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Biological Sex</Text>
          <Text style={styles.rowValue}>{gender ?? "--"}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Height</Text>
          <Text style={styles.rowValue}>{heightCm ?? "--"} cm</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Current BMI</Text>
          <Text style={styles.rowValue}>
            {bmiFormatted ? `${bmiFormatted} (${bmiCategory})` : "--"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editLink: {
    ...typography.footnote,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
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
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
});
