import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { useDietStore } from "@/store/useDietStore";
import { useTranslation } from "@/locales";
import { MealType } from "@/diet/types";
import {
  DietSummaryHeader,
  HealthConditionAlertBanner,
  MealCard,
  NutritionGuidelinesCard,
  DietPreferencesModal,
  SwapMealModal,
} from "@/components/diet";
import { ArrowLeft, MessageSquarePlus } from "lucide-react-native";

export default function DietPlannerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeProfile, loadProfiles } = useProfileStore();
  const {
    preferences,
    activePlan,
    targets,
    conditionRules,
    waterGlasses,
    isLoading,
    loadDietForProfile,
    updatePreferences,
    swapMeal,
    toggleMealAdherence,
    adjustWater,
  } = useDietStore();

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [swappingMealType, setSwappingMealType] = useState<MealType | null>(null);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (activeProfile) {
      loadDietForProfile(activeProfile);
    }
  }, [activeProfile, loadDietForProfile]);

  const handleAskDietician = () => {
    router.push("/(tabs)/chat");
  };

  const mealSlots: MealType[] = [
    "breakfast",
    "morning_snack",
    "lunch",
    "evening_snack",
    "dinner",
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top App Bar with Back Button */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.topBarCenter}>
          <Text style={styles.screenHeader}>{t.diet.title}</Text>
          <Text style={styles.profileSubtitle}>
            {activeProfile?.name || "Profile"} • {activeProfile?.age}y
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.chatShortcutBtn, pressed && styles.pressed]}
          onPress={handleAskDietician}
          accessibilityRole="button"
          accessibilityLabel="Ask AI Dietician"
        >
          <MessageSquarePlus size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {isLoading || !targets || !activePlan ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textPrimary} />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Caloric & Macro Summary */}
          <DietSummaryHeader
            targets={targets}
            waterGlasses={waterGlasses}
            onAdjustWater={adjustWater}
            onOpenPreferences={() => setShowPreferencesModal(true)}
          />

          {/* Clinical Alert & Safety Banner */}
          {conditionRules && (
            <HealthConditionAlertBanner rules={conditionRules} />
          )}

          {/* Daily Meal Schedule List */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{t.diet.mealsHeading}</Text>
          </View>

          {mealSlots.map((slot) => {
            const scheduled = activePlan.meals[slot];
            if (!scheduled) return null;
            return (
              <MealCard
                key={slot}
                scheduled={scheduled}
                onToggleAdherence={() => toggleMealAdherence(slot)}
                onOpenSwap={() => setSwappingMealType(slot)}
              />
            );
          })}

          {/* Clinical Nutrition Guidelines & Recommendations */}
          {conditionRules && (
            <NutritionGuidelinesCard rules={conditionRules} />
          )}
        </ScrollView>
      )}

      {/* Preferences Modal */}
      {activeProfile && (
        <DietPreferencesModal
          visible={showPreferencesModal}
          preferences={preferences}
          onClose={() => setShowPreferencesModal(false)}
          onSave={(updates) => updatePreferences(updates, activeProfile)}
        />
      )}

      {/* Swap Meal Modal */}
      {swappingMealType && activePlan && (
        <SwapMealModal
          visible={!!swappingMealType}
          mealType={swappingMealType}
          alternatives={activePlan.meals[swappingMealType]?.alternatives || []}
          onClose={() => setSwappingMealType(null)}
          onSelectAlternative={(mealId) => swapMeal(swappingMealType, mealId)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: {
    alignItems: "center",
  },
  screenHeader: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  profileSubtitle: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chatShortcutBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  sectionHeaderRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
