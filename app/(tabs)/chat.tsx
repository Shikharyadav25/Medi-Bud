import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import { MessageSquare } from "lucide-react-native";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MessageSquare size={28} color={colors.textPrimary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>AI Doctor Consultation</Text>
        <Text style={styles.desc}>
          Profile-aware AI consultation via secure Cloud Function proxy is scheduled for Phase 3.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
    maxWidth: 380,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
