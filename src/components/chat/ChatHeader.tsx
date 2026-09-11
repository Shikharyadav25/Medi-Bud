import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { Wifi, WifiOff, SquarePen, Languages, History } from "lucide-react-native";

interface ChatHeaderProps {
  title?: string;
  savedCount?: number;
  onOpenHistory: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onNewChat: () => void;
  language?: "en" | "hi";
  onToggleLanguage?: () => void;
}

export function ChatHeader({
  title = "AI Doctor",
  savedCount = 0,
  onOpenHistory,
  isOffline,
  onToggleOffline,
  onNewChat,
  language = "en",
  onToggleLanguage,
}: ChatHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Left: History Drawer Button */}
      <Pressable
        style={styles.historyBtn}
        onPress={onOpenHistory}
        accessibilityRole="button"
        accessibilityLabel={`Open chat history. ${savedCount} saved consultations.`}
      >
        <History size={18} color={colors.textPrimary} strokeWidth={2} />
        {savedCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {savedCount > 99 ? "99+" : savedCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Center: Title */}
      <Pressable style={styles.titleColumn} onPress={onOpenHistory}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>
          {language === "hi" ? "प्रोफ़ाइल-जागरूक AI परामर्श" : "Tap to browse past chats"}
        </Text>
      </Pressable>

      {/* Right Actions: New Chat, Offline Toggle, Language */}
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
            <Languages size={12} color={colors.textPrimary} strokeWidth={2} />
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
            <WifiOff size={11} color={colors.emergency.text} />
          ) : (
            <Wifi size={11} color={colors.selfCare.text} />
          )}
          <Text
            style={[
              styles.badgeText,
              isOffline ? styles.badgeTextOffline : styles.badgeTextOnline,
            ]}
          >
            {isOffline ? "Offline" : "Online"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.newChatBtn}
          onPress={onNewChat}
          accessibilityRole="button"
          accessibilityLabel="Start new consultation"
        >
          <SquarePen size={17} color={colors.textPrimary} strokeWidth={2} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textInverse,
  },
  titleColumn: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption2,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  langToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: "600",
  },
  badgeTextOnline: {
    color: colors.selfCare.text,
  },
  badgeTextOffline: {
    color: colors.emergency.text,
  },
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
});
