import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { DecisionTreeOption } from "@/chat/types";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { ChevronRight } from "lucide-react-native";

interface ChatInteractiveOptionsProps {
  options?: DecisionTreeOption[];
  onSelectOption: (option: DecisionTreeOption) => void;
  disabled?: boolean;
}

export function ChatInteractiveOptions({
  options,
  onSelectOption,
  disabled = false,
}: ChatInteractiveOptionsProps) {
  if (!options || options.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select an option to proceed:</Text>
      <View style={styles.optionsList}>
        {options.map((opt, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.optionButtonPressed,
              disabled && styles.optionButtonDisabled,
            ]}
            onPress={() => !disabled && onSelectOption(opt)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              {opt.description && (
                <Text style={styles.optionDesc}>{opt.description}</Text>
              )}
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  sectionTitle: {
    ...typography.caption2,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  optionsList: {
    gap: spacing.xs + 2,
  },
  optionButton: {
    minHeight: accessibility.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.borderOpaque,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionButtonPressed: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderActive,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  optionLabel: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  optionDesc: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
