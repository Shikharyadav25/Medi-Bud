import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { PhoneCall, ShieldAlert, Ambulance, UserCheck, X } from "lucide-react-native";
import {
  callNationalEmergency,
  callAmbulance,
  callFamilyContact,
} from "@/services/emergencyService";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTranslation } from "@/locales";

interface EmergencyDialerModalProps {
  visible: boolean;
  onClose: () => void;
  onSetupContact?: () => void;
}

export function EmergencyDialerModal({
  visible,
  onClose,
  onSetupContact,
}: EmergencyDialerModalProps) {
  const { emergencyContact } = useSettingsStore();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <ShieldAlert size={24} color={colors.emergency.text} strokeWidth={2} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.modalTitle}>{t.emergency.title}</Text>
              <Text style={styles.modalSubtitle}>{t.emergency.subtitle}</Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Emergency Dial Modal"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Actions List */}
          <View style={styles.actionsList}>
            {/* 112 National Emergency */}
            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                styles.nationalAction,
                pressed && styles.itemPressed,
              ]}
              onPress={callNationalEmergency}
              accessibilityRole="button"
              accessibilityLabel="Call 112 National Emergency Helpline"
            >
              <View style={styles.actionIconContainer}>
                <PhoneCall size={20} color={colors.emergency.text} strokeWidth={2.5} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.nationalTitle}>{t.emergency.nationalEmergency}</Text>
                <Text style={styles.actionDesc}>{t.emergency.nationalEmergencyDesc}</Text>
              </View>
            </Pressable>

            {/* 102 Ambulance */}
            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && styles.itemPressed,
              ]}
              onPress={callAmbulance}
              accessibilityRole="button"
              accessibilityLabel="Call 102 Ambulance Medical Emergency"
            >
              <View style={styles.actionIconContainer}>
                <Ambulance size={20} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{t.emergency.ambulance}</Text>
                <Text style={styles.actionDesc}>{t.emergency.ambulanceDesc}</Text>
              </View>
            </Pressable>

            {/* Family Emergency Contact */}
            {emergencyContact ? (
              <Pressable
                style={({ pressed }) => [
                  styles.actionItem,
                  pressed && styles.itemPressed,
                ]}
                onPress={() => callFamilyContact(emergencyContact)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${emergencyContact.name} at ${emergencyContact.phone}`}
              >
                <View style={styles.actionIconContainer}>
                  <UserCheck size={20} color={colors.selfCare.text} strokeWidth={2} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    {emergencyContact.name} ({emergencyContact.relationship || "Contact"})
                  </Text>
                  <Text style={styles.actionDesc}>{emergencyContact.phone}</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.noContactCard}>
                <Text style={styles.noContactText}>{t.emergency.noFamilyContact}</Text>
                {onSetupContact && (
                  <Pressable
                    style={styles.setupBtn}
                    onPress={() => {
                      onClose();
                      onSetupContact();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Set up family emergency contact"
                  >
                    <Text style={styles.setupBtnText}>{t.emergency.setupContact}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Close Button */}
          <Pressable
            style={styles.dismissButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss Emergency Modal"
          >
            <Text style={styles.dismissText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 440,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.emergency.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  actionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    minHeight: accessibility.minTouchTarget + 6,
  },
  nationalAction: {
    backgroundColor: colors.emergency.bg,
    borderColor: colors.emergency.border,
  },
  itemPressed: {
    opacity: 0.85,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  nationalTitle: {
    ...typography.headline,
    color: colors.emergency.text,
    fontWeight: "700",
  },
  actionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  actionDesc: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noContactCard: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    alignItems: "center",
  },
  noContactText: {
    ...typography.caption1,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  setupBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  setupBtnText: {
    ...typography.footnote,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  dismissButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
  },
  dismissText: {
    ...typography.subheadline,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
