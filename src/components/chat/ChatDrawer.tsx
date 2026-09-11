import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  SectionList,
} from "react-native";
import { Conversation } from "@/chat/types";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { groupConversationsByDate } from "@/chat/historyGroup";
import {
  Plus,
  Search,
  X,
  Trash2,
  Stethoscope,
} from "lucide-react-native";

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
}

export function ChatDrawer({
  visible,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onClearAll,
}: ChatDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const sections = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  const handleStartNew = () => {
    onNewChat();
    onClose();
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.drawerCard}>
          {/* Drawer Top Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.logoBadge}>
                <Stethoscope size={16} color={colors.textPrimary} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Consultations</Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close chat history"
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* New Chat Primary Button */}
          <Pressable
            style={styles.newChatBtn}
            onPress={handleStartNew}
            accessibilityRole="button"
            accessibilityLabel="Start new consultation"
          >
            <Plus size={18} color={colors.textInverse} strokeWidth={2.5} />
            <Text style={styles.newChatText}>New Consultation</Text>
          </Pressable>

          {/* Search Input */}
          <View style={styles.searchBox}>
            <Search size={15} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search past chats..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Grouped History List */}
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatHistoryItem
                conversation={item}
                isActive={item.id === activeConversationId}
                onSelect={() => handleSelect(item.id)}
                onRename={(newTitle) => onRenameConversation(item.id, newTitle)}
                onDelete={() => onDeleteConversation(item.id)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {searchQuery ? "No matching chats found" : "No past consultations yet"}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Footer Actions */}
          <View style={styles.footer}>
            {showClearConfirm ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmClearText}>Clear all chats?</Text>
                <Pressable
                  style={styles.confirmClearBtn}
                  onPress={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                >
                  <Text style={styles.confirmClearBtnText}>Confirm</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelClearBtn}
                  onPress={() => setShowClearConfirm(false)}
                >
                  <Text style={styles.cancelClearBtnText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.footerRow}>
                <Text style={styles.countText}>
                  {conversations.length} {conversations.length === 1 ? "chat" : "chats"} saved locally
                </Text>
                {conversations.length > 0 && (
                  <Pressable
                    style={styles.clearBtn}
                    onPress={() => setShowClearConfirm(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all chats"
                  >
                    <Trash2 size={13} color={colors.textMuted} />
                    <Text style={styles.clearBtnText}>Clear All</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerCard: {
    width: "82%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    height: "100%",
    paddingTop: 54,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    fontSize: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  newChatBtn: {
    minHeight: accessibility.minTouchTarget,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  newChatText: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textInverse,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.subheadline,
    color: colors.textPrimary,
    paddingVertical: 2,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.caption2,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.footnote,
    color: colors.textMuted,
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countText: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearBtnText: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confirmClearText: {
    ...typography.caption2,
    fontWeight: "600",
    color: colors.emergency.text,
  },
  confirmClearBtn: {
    backgroundColor: colors.emergency.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  confirmClearBtnText: {
    ...typography.caption2,
    color: colors.textInverse,
    fontWeight: "700",
  },
  cancelClearBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  cancelClearBtnText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
});
