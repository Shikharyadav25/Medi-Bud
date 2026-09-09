import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { calculateBMI } from "@/lib/bmi";
import { Stethoscope, MessageSquare, Bell, ChevronRight, ShieldCheck } from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, loadProfile, syncStatus } = useProfileStore();

  useEffect(() => {
    loadProfile("local_user_default");
  }, [loadProfile]);

  const bmiResult = profile
    ? calculateBMI(profile.heightCm, profile.weightKg)
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Apple HIG Large Title Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.largeTitle}>Summary</Text>
            <Text style={styles.subheadline}>
              {profile ? `${profile.age}y • ${profile.gender}` : "Health Companion"}
            </Text>
          </View>

          {/* Sync Status Badge */}
          <View
            style={[
              styles.syncBadge,
              syncStatus === "synced" ? styles.syncOk : styles.syncPending,
            ]}
          >
            <View
              style={[
                styles.syncDot,
                syncStatus === "synced" ? styles.syncDotOk : styles.syncDotPending,
              ]}
            />
            <Text
              style={[
                styles.syncText,
                syncStatus === "synced" ? styles.syncOkText : styles.syncPendingText,
              ]}
            >
              {syncStatus === "synced" ? "Synced" : "Local Only"}
            </Text>
          </View>
        </View>

        {/* Apple Health Style Baseline Card */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Body Measurements</Text>
            <View style={styles.groupedCard}>
              <Pressable
                style={styles.cardHeaderAction}
                onPress={() => router.push("/(tabs)/profile")}
                accessibilityRole="button"
                accessibilityLabel="View and edit profile metrics"
              >
                <View style={styles.metricsGrid}>
                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Height</Text>
                    <Text style={styles.metricValue}>{profile.heightCm} cm</Text>
                  </View>
                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Weight</Text>
                    <Text style={styles.metricValue}>{profile.weightKg} kg</Text>
                  </View>
                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>BMI</Text>
                    <Text style={styles.metricValue}>
                      {bmiResult ? bmiResult.formatted : "--"}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>

              {profile.healthIssues ? (
                <>
                  <View style={styles.rowDivider} />
                  <View style={styles.conditionRow}>
                    <Text style={styles.conditionLabel}>Known Conditions</Text>
                    <Text style={styles.conditionValue}>{profile.healthIssues}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        )}

        {/* Quick Action Navigation Rows */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Health Services</Text>
          <View style={styles.groupedCard}>
            {/* Triage */}
            <Pressable
              style={styles.serviceRow}
              onPress={() => router.push("/(tabs)/triage")}
              accessibilityRole="button"
              accessibilityLabel="Open Symptom Checker Triage"
            >
              <View style={styles.serviceIconContainer}>
                <Stethoscope size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Symptom Checker</Text>
                <Text style={styles.serviceSubtitle}>
                  Instant rule-based triage over emergency signs (100% Offline)
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.rowDivider} />

            {/* AI Chat */}
            <Pressable
              style={styles.serviceRow}
              onPress={() => router.push("/(tabs)/chat")}
              accessibilityRole="button"
              accessibilityLabel="Open AI Doctor Consultation"
            >
              <View style={styles.serviceIconContainer}>
                <MessageSquare size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>AI Doctor Consultation</Text>
                <Text style={styles.serviceSubtitle}>
                  Profile-aware guidance and home remedies via Cloud Proxy
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.rowDivider} />

            {/* Reminders */}
            <Pressable
              style={styles.serviceRow}
              onPress={() => router.push("/(tabs)/reminders")}
              accessibilityRole="button"
              accessibilityLabel="Open Medication Reminders"
            >
              <View style={styles.serviceIconContainer}>
                <Bell size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Medication Reminders</Text>
                <Text style={styles.serviceSubtitle}>
                  Scheduled local device alerts and daily adherence tracking
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Footnote Guarantee */}
        <View style={styles.footerRow}>
          <ShieldCheck size={16} color={colors.textMuted} />
          <Text style={styles.footerNote}>
            Data encrypted locally on this device via SQLite.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xxl,
  },
  largeTitle: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  subheadline: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  syncDotOk: {
    backgroundColor: colors.selfCare.text,
  },
  syncDotPending: {
    backgroundColor: colors.soon.text,
  },
  syncOk: {
    backgroundColor: colors.selfCare.bg,
    borderColor: colors.selfCare.border,
  },
  syncPending: {
    backgroundColor: colors.soon.bg,
    borderColor: colors.soon.border,
  },
  syncText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  syncOkText: {
    color: colors.selfCare.text,
  },
  syncPendingText: {
    color: colors.soon.text,
  },
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
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    minHeight: accessibility.minTouchTarget + 10,
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  serviceContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  serviceTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  serviceSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerNote: {
    ...typography.footnote,
    color: colors.textMuted,
  },
});
