import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { NutritionalTargets } from "@/diet/types";
import { Flame, Droplets, Plus, Minus } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface DietSummaryHeaderProps {
  targets: NutritionalTargets;
  waterGlasses: number;
  onAdjustWater: (delta: number) => void;
  onOpenPreferences: () => void;
}

export function DietSummaryHeader({
  targets,
  waterGlasses,
  onAdjustWater,
  onOpenPreferences,
}: DietSummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* Primary Calorie Goal Display */}
      <View style={styles.topRow}>
        <View style={styles.calorieBlock}>
          <View style={styles.badgeRow}>
            <Flame size={18} color={colors.textPrimary} strokeWidth={2} />
            <Text style={styles.captionText}>{t.diet.dailyTarget}</Text>
          </View>
          <Text style={styles.calorieNumber}>
            {targets.dailyCalories}{" "}
            <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.prefsButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onOpenPreferences}
          accessibilityRole="button"
          accessibilityLabel="Change Diet Preferences"
        >
          <Text style={styles.prefsButtonText}>{t.diet.customizePreferences}</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Macronutrient Pills */}
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>{t.diet.protein}</Text>
          <Text style={styles.macroValue}>{targets.proteinG}g</Text>
        </View>

        <View style={styles.macroDivider} />

        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>{t.diet.carbs}</Text>
          <Text style={styles.macroValue}>{targets.carbsG}g</Text>
        </View>

        <View style={styles.macroDivider} />

        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>{t.diet.fat}</Text>
          <Text style={styles.macroValue}>{targets.fatG}g</Text>
        </View>

        <View style={styles.macroDivider} />

        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>{t.diet.fiber}</Text>
          <Text style={styles.macroValue}>{targets.fiberG}g</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Hydration Tracker */}
      <View style={styles.waterRow}>
        <View style={styles.waterInfo}>
          <Droplets size={18} color={colors.tint} strokeWidth={2} />
          <Text style={styles.waterText}>
            {t.diet.water}: {waterGlasses} / {Math.round(targets.waterLiters / 0.25)} {t.diet.glasses}
            <Text style={styles.waterSubText}> ({targets.waterLiters}L)</Text>
          </Text>
        </View>

        <View style={styles.waterControls}>
          <Pressable
            style={({ pressed }) => [
              styles.waterCircleBtn,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => onAdjustWater(-1)}
            accessibilityRole="button"
            accessibilityLabel="Decrease water intake by 1 glass"
          >
            <Minus size={14} color={colors.textPrimary} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.waterCircleBtn,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => onAdjustWater(1)}
            accessibilityRole="button"
            accessibilityLabel="Increase water intake by 1 glass"
          >
            <Plus size={14} color={colors.textPrimary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calorieBlock: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  captionText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calorieNumber: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    lineHeight: 38,
  },
  calorieUnit: {
    ...typography.title3,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  prefsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  prefsButtonText: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  macroValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  macroDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.borderSubtle,
  },
  waterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  waterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  waterText: {
    ...typography.subheadline,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  waterSubText: {
    color: colors.textSecondary,
    fontWeight: "400",
  },
  waterControls: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  waterCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
