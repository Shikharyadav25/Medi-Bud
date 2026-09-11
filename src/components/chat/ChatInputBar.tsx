import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Text,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { ArrowUp, ImagePlus, Mic, X } from "lucide-react-native";
import { VoiceInputSheet } from "./VoiceInputSheet";

interface ChatInputBarProps {
  onSendMessage: (
    text: string,
    image?: { uri: string; base64?: string } | null
  ) => void;
  isLoading: boolean;
  onSelectShortcut?: (text: string) => void;
  language?: "en" | "hi";
}

const SHORTCUT_CHIPS = [
  { label: "🔥 Burn Care", text: "How to treat a burn?" },
  { label: "🫀 Chest Pain", text: "Check my chest pain symptoms" },
  { label: "🌡️ High Fever", text: "High fever in toddler" },
  { label: "📖 Acid Reflux", text: "What helps with acid reflux and gas?" },
  { label: "🩺 Guided Triage", text: "Start guided symptom triage" },
];

export function ChatInputBar({
  onSendMessage,
  isLoading,
  onSelectShortcut,
  language = "en",
}: ChatInputBarProps) {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string;
  } | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64 || undefined,
        });
      }
    } catch {
      // Image picker canceled or unsupported
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    setInputText("");
    setSelectedImage(null);
    onSendMessage(trimmed, currentImage);
  };

  return (
    <View style={styles.outerContainer}>
      <VoiceInputSheet
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onVoiceTranscribed={(text) =>
          setInputText((prev) => (prev ? `${prev} ${text}` : text))
        }
        language={language}
      />

      {/* Image Preview thumbnail if selected */}
      {selectedImage && (
        <View style={styles.imagePreviewWrap}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          <Pressable
            style={styles.removeImageBtn}
            onPress={() => setSelectedImage(null)}
            accessibilityRole="button"
            accessibilityLabel="Remove attached image"
          >
            <X size={14} color={colors.textInverse} />
          </Pressable>
        </View>
      )}

      {/* Quick suggestions scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shortcutsRow}
      >
        {SHORTCUT_CHIPS.map((chip, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.shortcutChip,
              pressed && styles.shortcutChipPressed,
            ]}
            onPress={() => onSelectShortcut && onSelectShortcut(chip.text)}
            accessibilityRole="button"
            accessibilityLabel={chip.label}
          >
            <Text style={styles.shortcutText}>{chip.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputContainer}>
        {/* Image upload button */}
        <Pressable
          style={styles.actionIconBtn}
          onPress={handlePickImage}
          accessibilityRole="button"
          accessibilityLabel="Attach medical image or lab report"
        >
          <ImagePlus size={20} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>

        {/* Voice dictation button */}
        <Pressable
          style={styles.actionIconBtn}
          onPress={() => setShowVoiceModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Record voice message"
        >
          <Mic size={20} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>

        <TextInput
          style={styles.textInput}
          placeholder="Type in English, हिंदी, or Hinglish..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={1000}
        />

        <Pressable
          style={[
            styles.sendButton,
            (inputText.trim().length > 0 || selectedImage) && !isLoading
              ? styles.sendButtonActive
              : styles.sendButtonInactive,
          ]}
          onPress={handleSend}
          disabled={(inputText.trim().length === 0 && !selectedImage) || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <ArrowUp
              size={18}
              color={
                (inputText.trim().length > 0 || selectedImage)
                  ? colors.textInverse
                  : colors.textMuted
              }
              strokeWidth={2.5}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  imagePreviewWrap: {
    position: "relative",
    width: 60,
    height: 60,
    marginBottom: spacing.xs,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
  },
  removeImageBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutsRow: {
    gap: spacing.xs + 2,
    paddingBottom: spacing.xs,
  },
  shortcutChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shortcutChipPressed: {
    backgroundColor: colors.borderOpaque,
  },
  shortcutText: {
    ...typography.caption2,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: accessibility.minTouchTarget,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xxs,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    maxHeight: 100,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.surfaceSubtle,
  },
});
