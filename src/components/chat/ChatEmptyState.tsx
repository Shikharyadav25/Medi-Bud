import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { Stethoscope, Zap, GitBranch, BookOpen } from "lucide-react-native";

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  { label: "🔥 Burn Care Protocol", prompt: "How do I treat a hot water burn?" },
  { label: "🫀 Chest Pain Triage", prompt: "I have chest tightness, check my symptoms" },
  { label: "🌡️ Infant Fever Check", prompt: "What to do for baby fever?" },
  { label: "📖 GERD & Acidity", prompt: "What helps with severe acidity and heartburn?" },
  { label: "🦵 Sprained Ankle Care", prompt: "Twisted my ankle, is it sprained or broken?" },
  { label: "🫁 Asthma Attack Help", prompt: "Emergency steps for an asthma attack" },
];

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconCircle}>
        <Stethoscope size={32} color={colors.textPrimary} strokeWidth={2} />
      </View>

      <Text style={styles.title}>AI Health Companion</Text>
      <Text style={styles.subtitle}>
        Profile-aware doctor consultation online. 100% functional offline with verified clinical algorithms.
      </Text>

      {/* 3 Pillars Feature Highlights */}
      <View style={styles.featureGrid}>
        <View style={styles.featureCard}>
          <Zap size={16} color={colors.soon.text} />
          <Text style={styles.featureTitle}>Instant First-Aid</Text>
          <Text style={styles.featureDesc}>Burns, CPR, choking, bleeding steps in milliseconds</Text>
        </View>

        <View style={styles.featureCard}>
          <GitBranch size={16} color={colors.tint} />
          <Text style={styles.featureTitle}>Diagnostic Trees</Text>
          <Text style={styles.featureDesc}>Interactive flowcharts for safe symptom evaluation</Text>
        </View>

        <View style={styles.featureCard}>
          <BookOpen size={16} color={colors.selfCare.text} />
          <Text style={styles.featureTitle}>Medical Manual</Text>
          <Text style={styles.featureDesc}>Full-text search across clinical remedies & lifestyle</Text>
        </View>
      </View>

      {/* Suggested Quick Prompts */}
      <Text style={styles.promptsHeader}>Suggested Consultations</Text>
      <View style={styles.promptsContainer}>
        {STARTER_PROMPTS.map((item, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.promptChip,
              pressed && styles.promptChipPressed,
            ]}
            onPress={() => onSelectPrompt(item.prompt)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Text style={styles.promptText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    maxWidth: 320,
    lineHeight: 20,
  },
  featureGrid: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  featureTitle: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  featureDesc: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  promptsHeader: {
    ...typography.caption1,
    fontWeight: "600",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  promptsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
  promptChip: {
    minHeight: accessibility.minTouchTarget,
    backgroundColor: colors.surface,
    borderColor: colors.borderOpaque,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  promptChipPressed: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderActive,
  },
  promptText: {
    ...typography.footnote,
    fontWeight: "500",
    color: colors.textPrimary,
  },
});
