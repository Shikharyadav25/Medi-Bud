import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii, typography } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { calculateBMI } from "@/lib/bmi";
import { ShieldCheck } from "lucide-react-native";
import { useTranslation } from "@/locales";
import { BodyMetricsCard } from "@/components/dashboard/BodyMetricsCard";
import { HealthServicesCard } from "@/components/dashboard/HealthServicesCard";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { EmergencyDialerModal } from "@/components/common/EmergencyDialerModal";
import { AddFamilyMemberModal } from "@/components/profile/AddFamilyMemberModal";

export default function DashboardScreen() {
  const router = useRouter();
  const {
    profiles,
    activeProfile,
    activeProfileId,
    loadProfiles,
    setActiveProfile,
    syncStatus,
  } = useProfileStore();
  const { loadSettings } = useSettingsStore();
  const { t } = useTranslation();

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    loadProfiles();
    loadSettings();
  }, [loadProfiles, loadSettings]);

  const bmiResult = activeProfile
    ? calculateBMI(activeProfile.heightCm, activeProfile.weightKg)
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Apple HIG Large Title Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.largeTitle}>{t.dashboard.title}</Text>
            <Text style={styles.subheadline}>
              {activeProfile
                ? `${activeProfile.name} • ${activeProfile.age}y • ${activeProfile.gender}`
                : t.dashboard.healthCompanion}
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
              {syncStatus === "synced" ? t.dashboard.synced : t.dashboard.queued}
            </Text>
          </View>
        </View>

        {/* Profile Switcher for Caregivers & Multi-member households */}
        <ProfileSwitcher
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfile}
          onAddProfile={() => setShowAddMember(true)}
        />

        {/* Body Metrics Baseline Card */}
        {activeProfile && (
          <BodyMetricsCard
            heightCm={activeProfile.heightCm}
            weightKg={activeProfile.weightKg}
            bmiFormatted={bmiResult ? bmiResult.formatted : undefined}
            healthIssues={activeProfile.healthIssues}
            onPress={() => router.push("/(tabs)/profile")}
          />
        )}

        {/* Health Services (Triage, AI Doctor, Reminders, Emergency 112) */}
        <HealthServicesCard
          onOpenEmergency={() => setShowEmergencyModal(true)}
        />

        {/* Local Security Footnote */}
        <View style={styles.footerRow}>
          <ShieldCheck size={16} color={colors.textMuted} />
          <Text style={styles.footerNote}>{t.dashboard.privateNote}</Text>
        </View>

        {/* Modals */}
        <EmergencyDialerModal
          visible={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          onSetupContact={() => router.push("/(tabs)/profile")}
        />

        <AddFamilyMemberModal
          visible={showAddMember}
          onClose={() => setShowAddMember(false)}
        />
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
    marginBottom: spacing.lg,
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
