import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { UserProfile, FamilyRelationship } from "@/lib/types";
import { User, Plus, Check } from "lucide-react-native";
import { useTranslation } from "@/locales";

interface FamilyMembersCardProps {
  profiles: UserProfile[];
  activeProfileId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
}

export function FamilyMembersCard({
  profiles,
  activeProfileId,
  onSelect,
  onAdd,
}: FamilyMembersCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>{t.profile.familyProfiles}</Text>
        <Pressable
          style={styles.addBtn}
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Add New Family Profile"
        >
          <Plus size={14} color={colors.textPrimary} strokeWidth={2.5} />
          <Text style={styles.addText}>{t.profile.addProfile}</Text>
        </Pressable>
      </View>

      <View style={styles.groupedCard}>
        {profiles.map((p, idx) => {
          const isActive = p.id === activeProfileId;
          const isLast = idx === profiles.length - 1;
          const relLabel =
            t.relationships[p.relationship as FamilyRelationship] ||
            p.relationship;

          return (
            <React.Fragment key={p.id ?? p.uid}>
              <Pressable
                style={({ pressed }) => [
                  styles.memberRow,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => p.id && onSelect(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}, ${p.age} years old, ${relLabel}`}
              >
                <View style={styles.iconWrap}>
                  <User size={18} color={colors.textPrimary} strokeWidth={2} />
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>{p.name}</Text>
                    {isActive && (
                      <View style={styles.activeTag}>
                        <Check size={12} color={colors.selfCare.text} strokeWidth={3} />
                        <Text style={styles.activeTagText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberSub}>
                    {relLabel} • {p.age}y • {p.gender}
                  </Text>
                </View>
              </Pressable>
              {!isLast && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  addText: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    minHeight: accessibility.minTouchTarget + 4,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  memberName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: colors.selfCare.bg,
  },
  activeTagText: {
    ...typography.caption2,
    color: colors.selfCare.text,
    fontWeight: "600",
  },
  memberSub: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.md + 36 + spacing.md,
  },
});
