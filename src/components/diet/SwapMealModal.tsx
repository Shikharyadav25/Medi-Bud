import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { MealItem, MealType } from "@/diet/types";
import { X, ArrowRight } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface SwapMealModalProps {
  visible: boolean;
  mealType: MealType | null;
  alternatives: MealItem[];
  onClose: () => void;
  onSelectAlternative: (mealId: string) => void;
}

export function SwapMealModal({
  visible,
  mealType,
  alternatives,
  onClose,
  onSelectAlternative,
}: SwapMealModalProps) {
  const { t, language } = useTranslation();

  if (!visible || !mealType) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t.diet.selectAlternative}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close alternative meals modal"
            >
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Alternative List */}
          <ScrollView
            style={styles.scrollList}
            showsVerticalScrollIndicator={false}
          >
            {alternatives.length === 0 ? (
              <Text style={styles.emptyText}>
                No further alternatives available matching your strict filters.
              </Text>
            ) : (
              alternatives.map((item) => {
                const name =
                  language === "hi" && item.nameHi ? item.nameHi : item.name;
                const portion =
                  language === "hi" && item.portionHi
                    ? item.portionHi
                    : item.portion;

                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.itemRow,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => {
                      onSelectAlternative(item.id);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Swap to ${name}`}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{name}</Text>
                      <Text style={styles.itemPortion}>{portion}</Text>
                      <View style={styles.itemTags}>
                        <Text style={styles.macroText}>
                          {item.calories} kcal • {item.proteinG}g P • {item.carbsG}g C
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={18} color={colors.textSecondary} />
                  </Pressable>
                );
              })
            )}
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
    maxHeight: "75%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
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
  scrollList: {
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    minHeight: accessibility.minTouchTarget + 6,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  itemInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  itemName: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemPortion: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  itemTags: {
    flexDirection: "row",
    marginTop: 2,
  },
  macroText: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.subheadline,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
});
