import { create } from "zustand";
import { UserProfile } from "@/lib/types";
import {
  DietPlan,
  DietPreferences,
  MealType,
  NutritionalTargets,
  ConditionRulesSummary,
} from "@/diet/types";
import {
  calculateNutritionalTargets,
  evaluateConditionRules,
  generateDietPlan,
} from "@/diet";
import {
  fetchDietPreferences,
  persistDietPreferences,
  fetchDailyMealLogs,
  toggleMealLogAdherence,
} from "@/db/client";

interface DietState {
  preferences: DietPreferences | null;
  activePlan: DietPlan | null;
  targets: NutritionalTargets | null;
  conditionRules: ConditionRulesSummary | null;
  dailyLogs: Record<string, boolean>;
  waterGlasses: number;
  isLoading: boolean;

  // Actions
  loadDietForProfile: (profile: UserProfile | null) => void;
  updatePreferences: (
    partial: Partial<DietPreferences>,
    profile: UserProfile
  ) => void;
  swapMeal: (mealType: MealType, alternativeMealId: string) => void;
  toggleMealAdherence: (mealType: MealType) => void;
  adjustWater: (delta: number) => void;
}

export const useDietStore = create<DietState>((set, get) => ({
  preferences: null,
  activePlan: null,
  targets: null,
  conditionRules: null,
  dailyLogs: {},
  waterGlasses: 4,
  isLoading: false,

  loadDietForProfile: (profile: UserProfile | null) => {
    if (!profile || !profile.id) {
      set({ preferences: null, activePlan: null, targets: null });
      return;
    }

    set({ isLoading: true });
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      let prefs = fetchDietPreferences(profile.id);

      const rules = evaluateConditionRules(
        profile.healthIssues || "",
        profile.allergies || ""
      );

      const activityLevel = prefs?.activityLevel || "sedentary";
      const primaryGoal = prefs?.primaryGoal || (rules.flags.lowGI ? "blood_sugar" : "maintain");

      const targets = calculateNutritionalTargets(
        profile.gender,
        profile.age,
        profile.heightCm,
        profile.weightKg,
        activityLevel,
        primaryGoal
      );

      if (!prefs) {
        prefs = persistDietPreferences({
          profileId: profile.id,
          dietType: "veg",
          cuisineType: "simple_home",
          activityLevel,
          primaryGoal,
          targetCalories: targets.dailyCalories,
          targetProtein: targets.proteinG,
          targetCarbs: targets.carbsG,
          targetFats: targets.fatG,
          targetWaterL: targets.waterLiters,
          updatedAt: Date.now(),
        });
      }

      const logs = fetchDailyMealLogs(profile.id, todayStr);
      const plan = generateDietPlan(profile.id, prefs, targets, rules, logs);

      set({
        preferences: prefs,
        targets,
        conditionRules: rules,
        activePlan: plan,
        dailyLogs: logs,
        isLoading: false,
      });
    } catch (err) {
      console.warn("Failed to load diet for profile:", err);
      set({ isLoading: false });
    }
  },

  updatePreferences: (partial: Partial<DietPreferences>, profile: UserProfile) => {
    const current = get().preferences;
    if (!profile.id) return;

    const mergedActivity = partial.activityLevel || current?.activityLevel || "sedentary";
    const mergedGoal = partial.primaryGoal || current?.primaryGoal || "maintain";

    const targets = calculateNutritionalTargets(
      profile.gender,
      profile.age,
      profile.heightCm,
      profile.weightKg,
      mergedActivity,
      mergedGoal
    );

    const updated: DietPreferences = {
      profileId: profile.id,
      dietType: partial.dietType || current?.dietType || "veg",
      cuisineType: partial.cuisineType || current?.cuisineType || "simple_home",
      activityLevel: mergedActivity,
      primaryGoal: mergedGoal,
      targetCalories: targets.dailyCalories,
      targetProtein: targets.proteinG,
      targetCarbs: targets.carbsG,
      targetFats: targets.fatG,
      targetWaterL: targets.waterLiters,
      updatedAt: Date.now(),
    };

    persistDietPreferences(updated);

    const rules =
      get().conditionRules ||
      evaluateConditionRules(profile.healthIssues || "", profile.allergies || "");
    const logs = get().dailyLogs;
    const plan = generateDietPlan(profile.id, updated, targets, rules, logs);

    set({
      preferences: updated,
      targets,
      conditionRules: rules,
      activePlan: plan,
    });
  },

  swapMeal: (mealType: MealType, alternativeMealId: string) => {
    const plan = get().activePlan;
    if (!plan) return;

    const currentScheduled = plan.meals[mealType];
    const newSelected = currentScheduled.alternatives.find(
      (m) => m.id === alternativeMealId
    );
    if (!newSelected) return;

    const updatedAlternatives = [
      currentScheduled.selectedMeal,
      ...currentScheduled.alternatives.filter((m) => m.id !== alternativeMealId),
    ];

    const updatedPlan: DietPlan = {
      ...plan,
      meals: {
        ...plan.meals,
        [mealType]: {
          ...currentScheduled,
          selectedMeal: newSelected,
          alternatives: updatedAlternatives,
        },
      },
    };

    set({ activePlan: updatedPlan });
  },

  toggleMealAdherence: (mealType: MealType) => {
    const plan = get().activePlan;
    const prefs = get().preferences;
    if (!plan || !prefs) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const currentCompleted = !!plan.meals[mealType]?.isCompleted;
    const nextCompleted = !currentCompleted;

    const scheduled = plan.meals[mealType];
    toggleMealLogAdherence(
      prefs.profileId,
      todayStr,
      mealType,
      scheduled.selectedMeal.id,
      nextCompleted
    );

    const updatedLogs = { ...get().dailyLogs, [mealType]: nextCompleted };
    const updatedPlan: DietPlan = {
      ...plan,
      meals: {
        ...plan.meals,
        [mealType]: {
          ...scheduled,
          isCompleted: nextCompleted,
        },
      },
    };

    set({
      activePlan: updatedPlan,
      dailyLogs: updatedLogs,
    });
  },

  adjustWater: (delta: number) => {
    set((state) => ({
      waterGlasses: Math.max(0, Math.min(16, state.waterGlasses + delta)),
    }));
  },
}));
