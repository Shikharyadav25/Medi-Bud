import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { ScheduledMeal } from "@/diet/types";
import { Check, ArrowLeftRight, Clock } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface MealCardProps {
  scheduled: ScheduledMeal;
  onToggleAdherence: () => void;
  onOpenSwap: () => void;
}

export function MealCard({
  scheduled,
  onToggleAdherence,
  onOpenSwap,
}: MealCardProps) {
  const { t, language } = useTranslation();
  const meal = scheduled.selectedMeal;

  const slotTitle = t.diet[scheduled.mealType] || scheduled.mealType;
  const displayName = language === "hi" && meal.nameHi ? meal.nameHi : meal.name;
  const displayPortion =
    language === "hi" && meal.portionHi ? meal.portionHi : meal.portion;

  return (
    <View style={[styles.card, scheduled.isCompleted && styles.completedCard]}>
      {/* Header with Slot Title & Swap Action */}
      <View style={styles.headerRow}>
        <View style={styles.slotBadge}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={styles.slotText}>{slotTitle}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.swapButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onOpenSwap}
          accessibilityRole="button"
          accessibilityLabel={`Swap ${slotTitle} meal`}
        >
          <ArrowLeftRight size={13} color={colors.textSecondary} />
          <Text style={styles.swapText}>{t.diet.swapMeal}</Text>
        </Pressable>
      </View>

      {/* Main Meal Content & Checkbox */}
      <View style={styles.bodyRow}>
        <View style={styles.contentCol}>
          <Text
            style={[
              styles.mealName,
              scheduled.isCompleted && styles.completedText,
            ]}
          >
            {displayName}
          </Text>
          <Text style={styles.portionText}>{displayPortion}</Text>

          {/* Health & Nutrient Badges */}
          <View style={styles.tagsRow}>
            <View style={styles.calBadge}>
              <Text style={styles.calBadgeText}>{meal.calories} kcal</Text>
            </View>
            <View style={styles.macroBadge}>
              <Text style={styles.macroBadgeText}>
                {meal.proteinG}g P • {meal.carbsG}g C • {meal.fatG}g F
              </Text>
            </View>
            {meal.healthTags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.healthTag}>
                <Text style={styles.healthTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Adherence Checkmark */}
        <Pressable
          style={({ pressed }) => [
            styles.checkCircle,
            scheduled.isCompleted && styles.checkCircleDone,
            pressed && styles.buttonPressed,
          ]}
          onPress={onToggleAdherence}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: scheduled.isCompleted }}
          accessibilityLabel={`Mark ${displayName} as ${
            scheduled.isCompleted ? "not eaten" : "eaten"
          }`}
        >
          {scheduled.isCompleted && (
            <Check size={16} color={colors.textInverse} strokeWidth={3} />
          )}
        </Pressable>
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
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  completedCard: {
    backgroundColor: colors.background,
    borderColor: colors.borderSubtle,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  slotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  slotText: {
    ...typography.caption2,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  swapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  swapText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  mealName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  portionText: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  calBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  calBadgeText: {
    ...typography.caption2,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  macroBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  macroBadgeText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  healthTag: {
    backgroundColor: colors.selfCare.bg,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  healthTagText: {
    ...typography.caption2,
    color: colors.selfCare.text,
    fontWeight: "600",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderOpaque,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    minHeight: accessibility.minTouchTarget - 16,
  },
  checkCircleDone: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
