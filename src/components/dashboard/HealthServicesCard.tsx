import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useTranslation } from "@/locales";
import {
  Stethoscope,
  MessageSquare,
  Bell,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";

interface HealthServicesCardProps {
  onOpenEmergency: () => void;
}

export function HealthServicesCard({ onOpenEmergency }: HealthServicesCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{t.dashboard.healthServices}</Text>
      <View style={styles.groupedCard}>
        {/* Symptom Checker */}
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
            <Text style={styles.serviceTitle}>{t.dashboard.symptomChecker}</Text>
            <Text style={styles.serviceSubtitle}>
              {t.dashboard.symptomCheckerSub}
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
            <Text style={styles.serviceTitle}>{t.dashboard.aiDoctor}</Text>
            <Text style={styles.serviceSubtitle}>{t.dashboard.aiDoctorSub}</Text>
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
            <Text style={styles.serviceTitle}>{t.dashboard.medReminders}</Text>
            <Text style={styles.serviceSubtitle}>
              {t.dashboard.medRemindersSub}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.rowDivider} />

        {/* One-Tap Emergency Dial */}
        <Pressable
          style={[styles.serviceRow, styles.emergencyRow]}
          onPress={onOpenEmergency}
          accessibilityRole="button"
          accessibilityLabel="Open Emergency Dial Assistance"
        >
          <View style={[styles.serviceIconContainer, styles.emergencyIcon]}>
            <ShieldAlert size={20} color={colors.emergency.text} strokeWidth={2.5} />
          </View>
          <View style={styles.serviceContent}>
            <Text style={[styles.serviceTitle, styles.emergencyText]}>
              {t.dashboard.emergencyQuickAction}
            </Text>
            <Text style={styles.serviceSubtitle}>
              {t.dashboard.emergencyQuickSub}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.emergency.text} />
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
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    minHeight: accessibility.minTouchTarget + 10,
  },
  emergencyRow: {
    backgroundColor: colors.emergency.bg,
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
  emergencyIcon: {
    backgroundColor: colors.surface,
  },
  serviceContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  serviceTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  emergencyText: {
    color: colors.emergency.text,
    fontWeight: "700",
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
});
