import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useTranslation } from "@/locales";
import { UtensilsCrossed, ChevronRight } from "lucide-react-native";

export function DietSettingsCard() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{t.profile.dietPreferences}</Text>
      <View style={styles.groupedCard}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push("/diet")}
          accessibilityRole="button"
          accessibilityLabel="Open Diet and Nutrition Plan"
        >
          <View style={styles.iconContainer}>
            <UtensilsCrossed size={18} color={colors.textPrimary} strokeWidth={2} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t.diet.title}</Text>
            <Text style={styles.desc}>{t.profile.dietPreferencesDesc}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    minHeight: accessibility.minTouchTarget + 8,
  },
  rowPressed: {
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.headline,
    fontSize: 16,
    color: colors.textPrimary,
  },
  desc: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
