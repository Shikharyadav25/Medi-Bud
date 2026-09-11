import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii, typography } from "@/theme/tokens";
import { ConditionRulesSummary } from "@/diet/types";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface NutritionGuidelinesCardProps {
  rules: ConditionRulesSummary;
}

export function NutritionGuidelinesCard({ rules }: NutritionGuidelinesCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{t.diet.clinicalGuidelines}</Text>

      <View style={styles.card}>
        {/* Foods to Prioritize */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <CheckCircle2 size={16} color={colors.selfCare.text} />
            <Text style={styles.blockTitle}>{t.diet.foodsToEat}</Text>
          </View>
          {rules.dos.map((item, idx) => (
            <Text key={idx} style={styles.bulletText}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Foods to Restrict */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <AlertTriangle size={16} color={colors.soon.text} />
            <Text style={styles.blockTitle}>{t.diet.foodsToAvoid}</Text>
          </View>
          {rules.donts.map((item, idx) => (
            <Text key={idx} style={styles.bulletText}>
              • {item}
            </Text>
          ))}
        </View>

        {rules.clinicalNotes.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Lightbulb size={16} color={colors.monitor.text} />
                <Text style={styles.blockTitle}>Clinical Advice</Text>
              </View>
              {rules.clinicalNotes.map((note, idx) => (
                <Text key={idx} style={styles.noteText}>
                  {note}
                </Text>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    padding: spacing.md,
  },
  block: {
    paddingVertical: spacing.xs,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  blockTitle: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bulletText: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: spacing.xs,
  },
  noteText: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
    paddingLeft: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
  },
});
