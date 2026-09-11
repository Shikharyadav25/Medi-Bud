import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, typography } from "@/theme/tokens";
import { ConditionRulesSummary } from "@/diet/types";
import { ShieldCheck, AlertCircle } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface HealthConditionAlertBannerProps {
  rules: ConditionRulesSummary;
}

export function HealthConditionAlertBanner({ rules }: HealthConditionAlertBannerProps) {
  const { t } = useTranslation();
  const hasConditions =
    rules.conditionsDetected.length > 0 || rules.allergensDetected.length > 0;

  if (!hasConditions) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.iconContainer}>
        <ShieldCheck size={18} color={colors.selfCare.text} strokeWidth={2} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t.diet.conditionAlert}</Text>
        <Text style={styles.body}>
          {[...rules.conditionsDetected, ...rules.allergensDetected].join(" • ")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.selfCare.bg,
    borderColor: colors.selfCare.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.caption1,
    fontWeight: "600",
    color: colors.selfCare.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    ...typography.footnote,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: "500",
  },
});
