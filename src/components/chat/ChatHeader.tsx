import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { Wifi, WifiOff, Plus, Languages } from "lucide-react-native";

interface ChatHeaderProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  onNewChat: () => void;
  language?: "en" | "hi";
  onToggleLanguage?: () => void;
}

export function ChatHeader({
  isOffline,
  onToggleOffline,
  onNewChat,
  language = "en",
  onToggleLanguage,
}: ChatHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>AI Doctor</Text>
        <Text style={styles.subtitle}>
          {language === "hi" ? "प्रोफ़ाइल-जागरूक परामर्श" : "Profile-Aware Consultation"}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        {onToggleLanguage && (
          <Pressable
            style={styles.langToggle}
            onPress={onToggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={`Switch language. Current language is ${
              language === "hi" ? "Hindi" : "English"
            }`}
          >
            <Languages size={13} color={colors.textPrimary} strokeWidth={2} />
            <Text style={styles.langToggleText}>
              {language === "hi" ? "हिंदी" : "EN"}
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.badge, isOffline ? styles.badgeOffline : styles.badgeOnline]}
          onPress={onToggleOffline}
          accessibilityRole="button"
          accessibilityLabel={`Toggle offline mode. Currently ${isOffline ? "Offline" : "Online"}`}
        >
          {isOffline ? (
            <WifiOff size={13} color={colors.emergency.text} />
          ) : (
            <Wifi size={13} color={colors.selfCare.text} />
          )}
          <Text
            style={[
              styles.badgeText,
              isOffline ? styles.badgeTextOffline : styles.badgeTextOnline,
            ]}
          >
            {isOffline ? "Offline Ready" : "Cloud Online"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={onNewChat}
          accessibilityRole="button"
          accessibilityLabel="Start new consultation"
        >
          <Plus size={18} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  badgeOnline: {
    backgroundColor: colors.selfCare.bg,
    borderColor: colors.selfCare.border,
  },
  badgeOffline: {
    backgroundColor: colors.emergency.bg,
    borderColor: colors.emergency.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextOnline: {
    color: colors.selfCare.text,
  },
  badgeTextOffline: {
    color: colors.emergency.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
