import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TextInput, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { EmergencyContact } from "@/lib/types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTranslation } from "@/locales";
import { Phone, X } from "lucide-react-native";

interface EmergencyContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EmergencyContactModal({
  visible,
  onClose,
}: EmergencyContactModalProps) {
  const { emergencyContact, setEmergencyContact } = useSettingsStore();
  const { t } = useTranslation();

  const [name, setName] = useState(emergencyContact?.name || "");
  const [phone, setPhone] = useState(emergencyContact?.phone || "");
  const [relationship, setRelationship] = useState(
    emergencyContact?.relationship || ""
  );

  useEffect(() => {
    if (emergencyContact) {
      setName(emergencyContact.name);
      setPhone(emergencyContact.phone);
      setRelationship(emergencyContact.relationship || "");
    }
  }, [emergencyContact]);

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }
    setEmergencyContact({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || "Family",
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Phone size={20} color={colors.emergency.text} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t.profile.emergencyContact}</Text>
              <Text style={styles.subtitle}>{t.profile.emergencyContactDesc}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.profile.profileName}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rohan (Son)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.profile.relationship}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Son, Daughter, Spouse"
              placeholderTextColor={colors.textMuted}
              value={relationship}
              onChangeText={setRelationship}
            />
          </View>

          <View style={styles.btnRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>{t.common.cancel}</Text>
            </Pressable>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>{t.common.save}</Text>
            </Pressable>
          </View>
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
    maxWidth: 420,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.emergency.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: accessibility.minTouchTarget,
    color: colors.textPrimary,
  },
  btnRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    ...typography.subheadline,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    ...typography.subheadline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
