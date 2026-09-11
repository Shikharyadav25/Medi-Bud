import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { UserProfile } from "@/lib/types";
import { Plus, User, Users } from "lucide-react-native";

interface ProfileSwitcherProps {
  profiles: UserProfile[];
  activeProfileId: number | null;
  onSelectProfile: (id: number) => void;
  onAddProfile?: () => void;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
}: ProfileSwitcherProps) {
  if (profiles.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Users size={16} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.headerLabel}>Active Profile</Text>
        </View>
        {onAddProfile && (
          <Pressable
            style={styles.addBtn}
            onPress={onAddProfile}
            accessibilityRole="button"
            accessibilityLabel="Add Family Member Profile"
          >
            <Plus size={14} color={colors.textPrimary} strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add Member</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          return (
            <Pressable
              key={p.id ?? p.uid}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => p.id && onSelectProfile(p.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${p.name}, ${p.age} years old`}
            >
              <User
                size={14}
                color={isActive ? colors.textInverse : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
              <Text
                style={[
                  styles.chipSubtext,
                  isActive ? styles.chipSubtextActive : styles.chipSubtextInactive,
                ]}
              >
                {p.age}y
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  addBtnText: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    minHeight: accessibility.minTouchTarget - 4,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  chipText: {
    ...typography.subheadline,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  chipTextInactive: {
    color: colors.textPrimary,
  },
  chipSubtext: {
    ...typography.caption2,
  },
  chipSubtextActive: {
    color: "rgba(255,255,255,0.75)",
  },
  chipSubtextInactive: {
    color: colors.textMuted,
  },
});
