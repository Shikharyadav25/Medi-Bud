import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { Stethoscope, ShieldCheck, HeartPulse } from "lucide-react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Apple HIG Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <HeartPulse size={30} color={colors.textPrimary} strokeWidth={2} />
          </View>
          <Text style={styles.largeTitle}>Medi Bud</Text>
          <Text style={styles.subheadline}>
            Personalised, offline-first health companion tailored for Indian healthcare realities.
          </Text>
        </View>

        {/* Apple Inset Grouped Feature List */}
        <View style={styles.groupedSection}>
          <Text style={styles.sectionHeader}>Key Capabilities</Text>

          <View style={styles.groupedCard}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Stethoscope size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Offline Triage Engine</Text>
                <Text style={styles.featureDesc}>
                  Clinical rule-based red flag detection works in airplane mode with zero latency.
                </Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <ShieldCheck size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Private On-Device Storage</Text>
                <Text style={styles.featureDesc}>
                  Your health profile, medications, and allergies remain securely on your phone.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Pinned Action per Apple HIG */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/onboarding")}
            accessibilityRole="button"
            accessibilityLabel="Get Started with Health Profile Setup"
            accessibilityHint="Navigates to the 3-step personal health questionnaire"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Text style={styles.footnote}>
            Medi Bud provides informational health guidance, not official diagnosis.
            In acute medical emergencies, call 112 immediately.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  largeTitle: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheadline: {
    ...typography.subheadline,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  groupedSection: {
    flex: 1,
    justifyContent: "center",
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
  featureRow: {
    flexDirection: "row",
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg + 36 + spacing.md, // Apple HIG row divider inset
  },
  bottomBar: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  primaryButton: {
    minHeight: 52, // Standard Apple prominent button height
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
  footnote: {
    ...typography.caption1,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
