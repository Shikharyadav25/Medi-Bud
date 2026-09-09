import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { Stethoscope } from "lucide-react-native";

export default function TriageScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Stethoscope size={28} color={colors.textPrimary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Offline Symptom Triage</Text>
        <Text style={styles.desc}>
          Deterministic, rule-based clinical decision engine is scheduled for Phase 2.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
    maxWidth: 380,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
