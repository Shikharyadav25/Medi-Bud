import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { FamilyRelationship } from "@/lib/types";
import { useProfileStore } from "@/store/useProfileStore";
import { useTranslation } from "@/locales";
import { UserPlus, X } from "lucide-react-native";

interface AddFamilyMemberModalProps {
  visible: boolean;
  onClose: () => void;
}

const RELATIONSHIPS: FamilyRelationship[] = ["parent", "child", "spouse", "other", "self"];

export function AddFamilyMemberModal({ visible, onClose }: AddFamilyMemberModalProps) {
  const { createProfile } = useProfileStore();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<FamilyRelationship>("parent");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Female");
  const [weightKg, setWeightKg] = useState("65");
  const [heightCm, setHeightCm] = useState("165");

  const handleCreate = async () => {
    if (!name.trim() || !age.trim()) return;
    await createProfile({
      uid: `prof_${Date.now()}`,
      accountId: "local_account_default",
      name: name.trim(),
      relationship,
      age: parseInt(age, 10) || 30,
      gender,
      heightCm: parseFloat(heightCm) || 165,
      weightKg: parseFloat(weightKg) || 65,
      healthIssues: "",
      medications: "",
      allergies: "",
    });
    setName("");
    setAge("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <UserPlus size={20} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>{t.profile.addProfile}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.profileName}</Text>
              <TextInput style={styles.input} placeholder="e.g. Maa, Papa, Aarav" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.relationship}</Text>
              <View style={styles.relRow}>
                {RELATIONSHIPS.map((rel) => (
                  <Pressable key={rel} style={[styles.relChip, relationship === rel && styles.relChipActive]} onPress={() => setRelationship(rel)}>
                    <Text style={[styles.relText, relationship === rel && styles.relTextActive]}>{t.relationships[rel] || rel}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>{t.profile.age}</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 58" placeholderTextColor={colors.textMuted} value={age} onChangeText={setAge} maxLength={3} />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>{t.profile.gender}</Text>
                <View style={styles.genderRow}>
                  {["Female", "Male"].map((g) => (
                    <Pressable key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>{t.profile.weight}</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} maxLength={3} />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>{t.profile.height}</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} maxLength={3} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose} accessibilityRole="button">
              <Text style={styles.cancelText}>{t.common.cancel}</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleCreate} accessibilityRole="button">
              <Text style={styles.saveText}>{t.common.save}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: spacing.lg },
  modalCard: { backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderWidth: 1, borderRadius: radii.xl, padding: spacing.xl, width: "100%", maxWidth: 440, maxHeight: "85%" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: radii.full, backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center", marginRight: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  closeBtn: { padding: spacing.xs },
  scroll: { marginVertical: spacing.xs },
  inputGroup: { marginBottom: spacing.md },
  label: { ...typography.caption1, color: colors.textSecondary, fontWeight: "600", marginBottom: 4 },
  input: { ...typography.body, backgroundColor: colors.background, borderColor: colors.borderSubtle, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, minHeight: accessibility.minTouchTarget, color: colors.textPrimary },
  relRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  relChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.full, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.background },
  relChipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  relText: { ...typography.caption1, color: colors.textSecondary, fontWeight: "500" },
  relTextActive: { color: colors.textInverse },
  twoCol: { flexDirection: "row", gap: spacing.md },
  flex1: { flex: 1 },
  genderRow: { flexDirection: "row", gap: 4 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: "center", backgroundColor: colors.background },
  genderBtnActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  genderText: { ...typography.caption1, color: colors.textSecondary, fontWeight: "600" },
  genderTextActive: { color: colors.textInverse },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  cancelBtn: { flex: 1, minHeight: 46, borderRadius: radii.md, backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center" },
  cancelText: { ...typography.subheadline, color: colors.textSecondary, fontWeight: "600" },
  saveBtn: { flex: 1, minHeight: 46, borderRadius: radii.md, backgroundColor: colors.textPrimary, alignItems: "center", justifyContent: "center" },
  saveText: { ...typography.subheadline, color: colors.textInverse, fontWeight: "600" },
});
