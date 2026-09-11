import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { ChatMessage, DecisionTreeOption } from "@/chat/types";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { speakText, stopSpeaking } from "@/services/speechService";
import { ChatCardSection } from "./ChatCardSection";
import { ChatInteractiveOptions } from "./ChatInteractiveOptions";
import {
  Stethoscope,
  User,
  Copy,
  Check,
  Volume2,
  Square,
} from "lucide-react-native";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectOption?: (option: DecisionTreeOption) => void;
  isLastMessage?: boolean;
  language?: "en" | "hi";
}

export function ChatMessageItem({
  message,
  onSelectOption,
  isLastMessage = false,
  language = "en",
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isUser = message.role === "user";

  useEffect(() => {
    return () => {
      if (isPlayingAudio) {
        stopSpeaking();
      }
    };
  }, [isPlayingAudio]);

  const handleCopy = async () => {
    if (!message.content) return;
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(message.content, {
        language,
        onDone: () => setIsPlayingAudio(false),
        onStopped: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const sourceLabel =
    message.source === "intent"
      ? "Offline Intent"
      : message.source === "decision_tree"
      ? "Offline Triage Tree"
      : message.source === "manual"
      ? "Offline Manual"
      : message.source === "outbox_pending"
      ? "Queued for Sync"
      : "Cloud AI";

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      {!isUser && (
        <View style={styles.avatarBox}>
          <Stethoscope size={16} color={colors.textPrimary} />
        </View>
      )}

      <Pressable
        onLongPress={handleCopy}
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          isPlayingAudio && styles.bubblePlayingAudio,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantMetaRow}>
            <Text style={styles.doctorLabel}>Medi Bud AI</Text>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceText}>{sourceLabel}</Text>
            </View>
          </View>
        )}

        {/* Attached image thumbnail */}
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            style={styles.messageImage}
            resizeMode="cover"
            accessibilityLabel="Attached photo"
          />
        )}

        <Text
          style={[
            styles.messageText,
            isUser ? styles.textUser : styles.textAssistant,
          ]}
        >
          {message.content}
        </Text>

        {message.cards && message.cards.length > 0 && (
          <ChatCardSection cards={message.cards} />
        )}

        {message.interactiveOptions && onSelectOption && (
          <ChatInteractiveOptions
            options={message.interactiveOptions}
            onSelectOption={onSelectOption}
            disabled={!isLastMessage}
          />
        )}

        {/* Footer with time and actions */}
        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              isUser ? styles.timeUser : styles.timeAssistant,
            ]}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          <View style={styles.footerActions}>
            {!isUser && (
              <Pressable
                onPress={handleToggleAudio}
                hitSlop={8}
                style={styles.copyButton}
                accessibilityRole="button"
                accessibilityLabel={
                  isPlayingAudio ? "Stop reading aloud" : "Listen to advice"
                }
              >
                {isPlayingAudio ? (
                  <Square size={11} color={colors.emergency.text} strokeWidth={2.5} />
                ) : (
                  <Volume2 size={12} color={colors.textMuted} strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.actionText,
                    isPlayingAudio ? styles.actionTextEmergency : styles.actionTextMuted,
                  ]}
                >
                  {isPlayingAudio ? "Stop" : "Listen"}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleCopy}
              hitSlop={8}
              style={styles.copyButton}
              accessibilityRole="button"
              accessibilityLabel="Copy message"
            >
              {copied ? (
                <Check
                  size={12}
                  color={isUser ? "#86EFAC" : colors.selfCare.text}
                  strokeWidth={2.5}
                />
              ) : (
                <Copy
                  size={12}
                  color={isUser ? "rgba(255,255,255,0.6)" : colors.textMuted}
                  strokeWidth={2}
                />
              )}
              {copied && (
                <Text
                  style={[
                    styles.copiedText,
                    isUser ? styles.copiedTextUser : styles.copiedTextAssistant,
                  ]}
                >
                  Copied
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>

      {isUser && (
        <View style={styles.userAvatarBox}>
          <User size={14} color={colors.textInverse} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs + 2,
  },
  wrapperUser: {
    justifyContent: "flex-end",
  },
  wrapperAssistant: {
    justifyContent: "flex-start",
  },
  avatarBox: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  userAvatarBox: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderBottomLeftRadius: radii.xs,
  },
  bubblePlayingAudio: {
    borderColor: colors.primary,
  },
  messageImage: {
    width: 200,
    height: 140,
    borderRadius: radii.md,
    marginBottom: spacing.xs + 2,
  },
  assistantMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  doctorLabel: {
    ...typography.caption2,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  sourceTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  textUser: {
    color: colors.textInverse,
  },
  textAssistant: {
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeText: {
    ...typography.caption2,
    fontSize: 10,
  },
  timeUser: {
    color: "rgba(255,255,255,0.6)",
  },
  timeAssistant: {
    color: colors.textMuted,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionTextEmergency: {
    color: colors.emergency.text,
  },
  actionTextMuted: {
    color: colors.textMuted,
  },
  copiedText: {
    fontSize: 10,
    fontWeight: "600",
  },
  copiedTextUser: {
    color: "#86EFAC",
  },
  copiedTextAssistant: {
    color: colors.selfCare.text,
  },
});
