import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import { Mic, X, Check } from "lucide-react-native";

interface VoiceRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onVoiceTranscribed: (text: string) => void;
}

export function VoiceRecordModal({
  visible,
  onClose,
  onVoiceTranscribed,
}: VoiceRecordModalProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (visible) {
      setSeconds(0);
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  const handleFinish = (sampleText?: string) => {
    const textToInsert =
      sampleText ||
      (seconds > 2
        ? "Mujhe kal raat se tez bukhar aur sar dard hai"
        : "I have a severe headache and nausea");
    onVoiceTranscribed(textToInsert);
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
        <View style={styles.card}>
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close voice modal"
          >
            <X size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.pulseCircle}>
            <Mic size={32} color={colors.textInverse} strokeWidth={2} />
          </View>

          <Text style={styles.title}>Listening to Voice...</Text>
          <Text style={styles.timer}>
            0:{seconds < 10 ? `0${seconds}` : seconds}
          </Text>

          <Text style={styles.instruction}>
            Speak clearly in English, Hindi, or your preferred language.
          </Text>

          {/* Quick voice preset shortcuts */}
          <View style={styles.presetContainer}>
            <Pressable
              style={styles.presetChip}
              onPress={() => handleFinish("I burned my hand on hot oil")}
            >
              <Text style={styles.presetText}>"Burn care steps"</Text>
            </Pressable>
            <Pressable
              style={styles.presetChip}
              onPress={() => handleFinish("Mujhe pet me tez dard ho raha hai")}
            >
              <Text style={styles.presetText}>"Pet me tez dard"</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.doneButton}
            onPress={() => handleFinish()}
            accessibilityRole="button"
            accessibilityLabel="Done recording"
          >
            <Check size={18} color={colors.textInverse} strokeWidth={2} />
            <Text style={styles.doneButtonText}>Finish & Transcribe</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderColor: colors.borderSubtle,
    borderWidth: 1,
  },
  closeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    width: 68,
    height: 68,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  timer: {
    ...typography.title2,
    color: colors.emergency.text,
    marginVertical: spacing.xs,
  },
  instruction: {
    ...typography.footnote,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  presetContainer: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  presetChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  presetText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  doneButton: {
    minHeight: accessibility.minTouchTarget,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
  },
  doneButtonText: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textInverse,
  },
});
