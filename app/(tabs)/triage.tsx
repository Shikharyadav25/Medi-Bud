import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { Stethoscope, ShieldAlert, PhoneCall, ArrowRight } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { isPediatricProfile, getPediatricSafetyGuidance } from "@/triage/pediatricGuard";
import { useTranslation } from "@/locales";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { EmergencyDialerModal } from "@/components/common/EmergencyDialerModal";

export default function TriageScreen() {
  const { profiles, activeProfile, activeProfileId, setActiveProfile } =
    useProfileStore();
  const { t, language } = useTranslation();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const isChild = isPediatricProfile(activeProfile);
  const pediatricGuidance = getPediatricSafetyGuidance(activeProfile, language);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Switcher */}
      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={setActiveProfile}
      />

      {isChild ? (
        /* Pediatric Safety Guardrail Card */
        <View style={styles.pediatricCard}>
          <View style={styles.pediatricIconWrap}>
            <ShieldAlert size={32} color={colors.emergency.text} strokeWidth={2} />
          </View>
          <Text style={styles.pediatricTitle}>{pediatricGuidance.title}</Text>
          <Text style={styles.pediatricReason}>{pediatricGuidance.reason}</Text>

          <View style={styles.precautionsBox}>
            <Text style={styles.precautionsHeader}>Key Safety Rules:</Text>
            {pediatricGuidance.keyPrecautions.map((p, idx) => (
              <View key={idx} style={styles.precautionItem}>
                <ArrowRight size={14} color={colors.emergency.text} />
                <Text style={styles.precautionText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.pediatricAction}>
            {pediatricGuidance.recommendedAction}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.emergencyButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowEmergencyModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t.triage.callDoctor}
          >
            <PhoneCall size={18} color={colors.textInverse} strokeWidth={2.5} />
            <Text style={styles.emergencyButtonText}>{t.triage.callDoctor}</Text>
          </Pressable>
        </View>
      ) : (
        /* Standard Adult Triage Card */
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Stethoscope size={28} color={colors.textPrimary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{t.triage.title}</Text>
          <Text style={styles.desc}>{t.triage.desc}</Text>
        </View>
      )}

      <EmergencyDialerModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
    marginTop: spacing.xl,
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
  pediatricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.emergency.border,
    borderWidth: 1.5,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  pediatricIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.emergency.bg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  pediatricTitle: {
    ...typography.h3,
    color: colors.emergency.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  pediatricReason: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  precautionsBox: {
    backgroundColor: colors.emergency.bg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  precautionsHeader: {
    ...typography.footnote,
    fontWeight: "700",
    color: colors.emergency.text,
    marginBottom: 4,
  },
  precautionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  precautionText: {
    ...typography.caption1,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  pediatricAction: {
    ...typography.footnote,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.emergency.text,
    borderRadius: radii.lg,
    minHeight: accessibility.minTouchTarget + 6,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  emergencyButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "700",
  },
});
