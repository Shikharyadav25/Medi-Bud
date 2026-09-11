import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Conversation } from "@/chat/types";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { MessageSquare, Pencil, Trash2, Check, X } from "lucide-react-native";

interface ChatHistoryItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export function ChatHistoryItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ChatHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(conversation.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSaveRename = () => {
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(trimmed);
    } else {
      setTitleText(conversation.title);
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setTitleText(conversation.title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={[styles.container, styles.containerEditing]}>
        <TextInput
          style={styles.renameInput}
          value={titleText}
          onChangeText={setTitleText}
          autoFocus
          onSubmitEditing={handleSaveRename}
          maxLength={40}
        />
        <View style={styles.actionGroup}>
          <Pressable
            style={styles.actionBtn}
            onPress={handleSaveRename}
            accessibilityRole="button"
            accessibilityLabel="Save title"
          >
            <Check size={16} color={colors.selfCare.text} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={handleCancelRename}
            accessibilityRole="button"
            accessibilityLabel="Cancel rename"
          >
            <X size={16} color={colors.textSecondary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (isConfirmingDelete) {
    return (
      <View style={[styles.container, styles.containerDeleting]}>
        <Text style={styles.confirmText} numberOfLines={1}>
          Delete consultation?
        </Text>
        <View style={styles.actionGroup}>
          <Pressable
            style={[styles.actionBtn, styles.deleteConfirmBtn]}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Confirm delete"
          >
            <Text style={styles.deleteConfirmText}>Delete</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => setIsConfirmingDelete(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancel delete"
          >
            <X size={16} color={colors.textSecondary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
      ]}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Open chat: ${conversation.title}`}
    >
      <View style={styles.leftContent}>
        <MessageSquare
          size={16}
          color={isActive ? colors.textPrimary : colors.textMuted}
          strokeWidth={1.75}
        />
        <Text
          style={[styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {conversation.title}
        </Text>
      </View>

      <View style={styles.actionGroup}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            setTitleText(conversation.title);
            setIsEditing(true);
          }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Rename conversation"
        >
          <Pencil size={13} color={colors.textMuted} strokeWidth={1.75} />
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => setIsConfirmingDelete(true)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Delete conversation"
        >
          <Trash2 size={13} color={colors.textMuted} strokeWidth={1.75} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginVertical: 2,
  },
  containerActive: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  containerPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  containerEditing: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  containerDeleting: {
    backgroundColor: colors.emergency.bg,
    borderWidth: 1,
    borderColor: colors.emergency.border,
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginRight: spacing.xs,
  },
  title: {
    ...typography.subheadline,
    color: colors.textSecondary,
    fontSize: 14,
  },
  titleActive: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  renameInput: {
    flex: 1,
    ...typography.subheadline,
    color: colors.textPrimary,
    paddingVertical: 2,
    fontSize: 14,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: radii.sm,
  },
  confirmText: {
    ...typography.caption1,
    fontWeight: "600",
    color: colors.emergency.text,
    flex: 1,
  },
  deleteConfirmBtn: {
    backgroundColor: colors.emergency.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  deleteConfirmText: {
    ...typography.caption2,
    fontWeight: "700",
    color: colors.textInverse,
  },
});
