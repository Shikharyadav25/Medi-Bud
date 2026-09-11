import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { colors, spacing, typography, radii, accessibility } from "@/theme/tokens";
import {
  createBrowserSpeechRecognition,
  WebSpeechSession,
} from "@/services/speechService";
import { Mic, X, Check, Volume2 } from "lucide-react-native";

interface VoiceInputSheetProps {
  visible: boolean;
  onClose: () => void;
  onVoiceTranscribed: (text: string) => void;
  language?: "en" | "hi";
}

const VOICE_PRESETS = [
  { label: "Burn Care", text: "I burned my hand on hot cooking oil and it is blistering" },
  { label: "High Fever", text: "I have high fever and severe headache since yesterday" },
  { label: "Chest Discomfort", text: "Experiencing chest tightness and shortness of breath" },
  { label: "Stomach Acidity", text: "Severe stomach burning pain and acid reflux after meals" },
];

export function VoiceInputSheet({
  visible,
  onClose,
  onVoiceTranscribed,
  language = "en",
}: VoiceInputSheetProps) {
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Listening to your voice...");
  const speechSessionRef = useRef<WebSpeechSession | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (visible) {
      setSeconds(0);
      setTranscript("");
      setStatusMessage("Listening to your voice...");

      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);

      // Initialize Web Speech Recognition if on Web
      if (Platform.OS === "web") {
        const session = createBrowserSpeechRecognition(language);
        if (session) {
          speechSessionRef.current = session;
          session.start(
            (text) => {
              setTranscript(text);
              setStatusMessage("Voice detected");
            },
            () => {
              setStatusMessage("Tap presets or speak louder");
            },
            () => {
              setStatusMessage("Ready to insert");
            }
          );
        } else {
          setStatusMessage("Microphone active. Speak or tap presets");
        }
      }
    } else {
      if (speechSessionRef.current) {
        speechSessionRef.current.stop();
        speechSessionRef.current = null;
      }
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (speechSessionRef.current) {
        speechSessionRef.current.stop();
        speechSessionRef.current = null;
      }
    };
  }, [visible, language]);

  const handleFinish = (overrideText?: string) => {
    const textToSend = (overrideText || transcript).trim();
    if (textToSend) {
      onVoiceTranscribed(textToSend);
    }
    onClose();
  };

  const formattedTimer = `0:${seconds < 10 ? `0${seconds}` : seconds}`;

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
            accessibilityLabel="Close voice input"
          >
            <X size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Animated pulsing mic */}
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner}>
              <Mic size={30} color={colors.textInverse} strokeWidth={2.2} />
            </View>
          </View>

          <Text style={styles.title}>Voice Input</Text>
          <Text style={styles.timer}>{formattedTimer}</Text>
          <Text style={styles.statusText}>{statusMessage}</Text>

          {/* Live Transcript Preview Box */}
          <View style={styles.transcriptBox}>
            <Text
              style={[
                styles.transcriptText,
                !transcript && styles.transcriptPlaceholder,
              ]}
              numberOfLines={4}
            >
              {transcript ||
                (language === "hi"
                  ? "यहाँ आपकी आवाज़ का अनुवाद दिखेगा..."
                  : "Your spoken words will appear here in real-time...")}
            </Text>
          </View>

          {/* Clinical Presets */}
          <Text style={styles.presetHeading}>Or tap a common clinical question:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsRow}
          >
            {VOICE_PRESETS.map((p, idx) => (
              <Pressable
                key={idx}
                style={styles.presetChip}
                onPress={() => handleFinish(p.text)}
                accessibilityRole="button"
                accessibilityLabel={p.label}
              >
                <Text style={styles.presetChipText}>{p.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel recording"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.doneBtn,
                !transcript && styles.doneBtnMuted,
              ]}
              onPress={() => handleFinish()}
              disabled={!transcript}
              accessibilityRole="button"
              accessibilityLabel="Insert voice text"
            >
              <Check size={16} color={colors.textInverse} strokeWidth={2.5} />
              <Text style={styles.doneBtnText}>Use Text</Text>
            </Pressable>
          </View>
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
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
  pulseOuter: {
    width: 76,
    height: 76,
    borderRadius: radii.full,
    backgroundColor: "rgba(9, 9, 11, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  pulseInner: {
    width: 58,
    height: 58,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  timer: {
    ...typography.title2,
    color: colors.emergency.text,
    marginVertical: 2,
    fontWeight: "700",
  },
  statusText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  transcriptBox: {
    width: "100%",
    minHeight: 70,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
    justifyContent: "center",
  },
  transcriptText: {
    ...typography.subheadline,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  transcriptPlaceholder: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  presetHeading: {
    ...typography.caption2,
    color: colors.textMuted,
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  presetsRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  presetChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  presetChipText: {
    ...typography.caption2,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  actionRow: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    minHeight: accessibility.minTouchTarget,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  doneBtn: {
    flex: 1.5,
    minHeight: accessibility.minTouchTarget,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  doneBtnMuted: {
    opacity: 0.5,
  },
  doneBtnText: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.textInverse,
  },
});
