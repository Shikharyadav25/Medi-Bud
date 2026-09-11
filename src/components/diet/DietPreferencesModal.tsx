import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import {
  DietPreferences,
  DietType,
  CuisineType,
  ActivityLevel,
  HealthGoal,
} from "@/diet/types";
import { X } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface DietPreferencesModalProps {
  visible: boolean;
  preferences: DietPreferences | null;
  onClose: () => void;
  onSave: (updates: Partial<DietPreferences>) => void;
}

const DIET_TYPES: DietType[] = ["veg", "vegan", "eggetarian", "non_veg", "jain"];
const CUISINE_TYPES: CuisineType[] = [
  "simple_home",
  "north_indian",
  "south_indian",
  "high_protein",
];
const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
];
const HEALTH_GOALS: HealthGoal[] = [
  "weight_loss",
  "maintain",
  "muscle_gain",
  "blood_sugar",
  "heart_health",
];

export function DietPreferencesModal({
  visible,
  preferences,
  onClose,
  onSave,
}: DietPreferencesModalProps) {
  const { t } = useTranslation();

  const [dietType, setDietType] = useState<DietType>(
    preferences?.dietType || "veg"
  );
  const [cuisineType, setCuisineType] = useState<CuisineType>(
    preferences?.cuisineType || "simple_home"
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    preferences?.activityLevel || "sedentary"
  );
  const [primaryGoal, setPrimaryGoal] = useState<HealthGoal>(
    preferences?.primaryGoal || "maintain"
  );

  if (!visible) return null;

  const handleSave = () => {
    onSave({
      dietType,
      cuisineType,
      activityLevel,
      primaryGoal,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.diet.customizePreferences}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close diet preferences"
            >
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Diet Style */}
            <Text style={styles.sectionLabel}>{t.diet.dietType}</Text>
            <View style={styles.chipRow}>
              {DIET_TYPES.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.chip,
                    dietType === item && styles.chipSelected,
                  ]}
                  onPress={() => setDietType(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      dietType === item && styles.chipTextSelected,
                    ]}
                  >
                    {t.diet[item] || item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Health Goal */}
            <Text style={styles.sectionLabel}>{t.diet.goal}</Text>
            <View style={styles.chipRow}>
              {HEALTH_GOALS.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.chip,
                    primaryGoal === item && styles.chipSelected,
                  ]}
                  onPress={() => setPrimaryGoal(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      primaryGoal === item && styles.chipTextSelected,
                    ]}
                  >
                    {t.diet[item] || item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Cuisine */}
            <Text style={styles.sectionLabel}>{t.diet.cuisine}</Text>
            <View style={styles.chipRow}>
              {CUISINE_TYPES.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.chip,
                    cuisineType === item && styles.chipSelected,
                  ]}
                  onPress={() => setCuisineType(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      cuisineType === item && styles.chipTextSelected,
                    ]}
                  >
                    {t.diet[item] || item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Activity Level */}
            <Text style={styles.sectionLabel}>{t.diet.activity}</Text>
            <View style={styles.chipRow}>
              {ACTIVITY_LEVELS.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.chip,
                    activityLevel === item && styles.chipSelected,
                  ]}
                  onPress={() => setActivityLevel(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activityLevel === item && styles.chipTextSelected,
                    ]}
                  >
                    {t.diet[item] || item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Save Button */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save diet preferences"
            >
              <Text style={styles.saveButtonText}>
                {t.diet.savePreferences}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: accessibility.minTouchTarget - 4,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  saveButton: {
    minHeight: 50,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
